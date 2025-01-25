import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, InternalServerErrorException,Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import mongoose from 'mongoose';
import { Course, CourseDocument, DifficultyLevel } from '../Schemas/courses.schema';
import { User,UserDocument } from '../Schemas/users.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { VersioningService } from './versioning/versioning.service';


@Injectable()
export class CoursesService {
    private readonly logger = new Logger(CoursesService.name);
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly versioningService: VersioningService
  ) {}

  // POST Methods
  async createCourse(userId: string, createCourseDto: CreateCourseDto) {
    const user= await this.userModel.findById(userId)
    if(user.role !== 'instructor'){
      return new Error("you are not an instructor")
    }
    if (!userId) {
      throw new Error('Instructor ID is required but missing.');
    }
    
    const { title, description, category, level } = createCourseDto;
    
    const existingCourse = await this.courseModel.findOne({ title: title.toLowerCase().trim(), userId });
    if (existingCourse) {
      throw new ConflictException(`Course with title "${title}" already exists for this instructor.`);
    }
    // Create a new course
    const newCourse = new this.courseModel({
      title: title.toLowerCase().trim(),
      description,
      category,
      level,
      userId, // Ensure this is passed correctly
      students: [],
      versionNumber: 1,
      versions: [],
    });
    await newCourse.save();
    // Add the new course to the instructor's createdCourses array
    await this.userModel.updateOne(
      { _id: userId },
      { $push: { createdCourses: newCourse._id } }
    );
    return {
      message: `Course "${title}" successfully created.`,
      course: {
        id: newCourse._id,
        title: newCourse.title,
        userId: newCourse.userId,
      },
    };
  }

  async enrollStudent(courseId: string, studentId: string, instructorId: string): Promise<Course> {
    await this.validateInstructor(instructorId);
    await this.validateStudent(studentId);

    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }
    if (course.userId.toString() !== instructorId) {
      throw new ForbiddenException('Only the instructor who created this course can enroll students');
    }

    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    if (course.students.some((id) => id.toString() === studentObjectId.toString())) {
      throw new ConflictException(`Student with ID "${studentId}" is already enrolled in this course`);
    }

    course.students.push(studentObjectId);
    await course.save();
    return course;
  }


  async enrollInCourse(courseId: string, studentId: string) {
    const isEnrolled = await this.courseModel.findOne({
      _id: courseId,
      students: { $in: [studentId] }
    });

    const user = await this.userModel.findOne({_id:studentId})
    // check if user is deleted
    if (!user) {
      throw new NotFoundException(`User with ID "${studentId}" not found`);
    }

    // check if user is available
    if (!user.setActive) {
      throw new BadRequestException(`User with ID "${studentId}" is not available`);
    }

    if (isEnrolled) {
      // If the student is already enrolled, throw a ConflictException
      throw new ConflictException(`Student with ID "${studentId}" is already enrolled in this course`);
    } else if(user.role == 'admin' || user.role=='instructor') {
    
      throw new ForbiddenException(`${user.role} cant enroll in courses`);

    }
    else{
      await this.courseModel.updateOne(
        { _id: courseId },
        { $push: { students: studentId } }
      );

      await this.userModel.updateOne(
        { _id: studentId },
        { $push: { enrolledCourses: courseId } }
      )
      
      // Log the successful enrollment
      this.logger.log(`Student with ID "${studentId}" successfully enrolled in course ${courseId}`);
      return {
        message: `Student with ID "${studentId}" successfully enrolled in course ${courseId}` // HTTP status code for Created
    }
    }
  
    // Return a success message in JSON format after enrollment

    
 
  }

  // GET Methods
  async getCourse(id: string) : Promise<Course[]> {

const course = await this.courseModel.aggregate([
  {
    $match: {
      _id: new mongoose.Types.ObjectId(id) // Convert string ID to ObjectId
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'instructor_details'
    }
  }
]);


if(!course){
  throw new BadRequestException("COURSE FETCH ERROR")
}

this.logger.log(course[0].title)

return course[0]

}



async getAllCoursesAdmin(): Promise<Course[]> {
  try {
    console.log('Fetching all courses...');
    const courses = await this.courseModel.find().exec();
    console.log('Fetched courses:', courses);
    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw new Error(`Error fetching courses: ${error.message}`);
  }
}

 
     
  

  async getCoursesForInstructor(userId: string): Promise<Course[]> {
    this.logger.log(userId)
    return await this.courseModel.find({ userId: userId , isAvailable:true});
  }

  async inviteStudent(email:string,courseId:string){
    this.logger.log("FUNC HIT EMAIL"+email)
    const user = await this.userModel.findOne({email:email})

    if(!user){
      throw new ForbiddenException("EMAIL DOES NOT EXIST")
    }
    if (user.setActive == false) {
      throw new BadRequestException(`User with ID "${user._id}" is not available`);
    }

    if(user.role.toString() != "student"){
      throw new UnauthorizedException("USER IS NOI A STUDENT")

    }

    const course = await this.courseModel.findById(courseId)

    if(!course){
      throw new ForbiddenException("COURSE DOES NOT EXIST")
    }

    let students: string[] = course.students.map((student: any) => student.toString());

    const id = user._id.toString()
    if(students.includes(id)){
      this.logger.log(`STUDENT Already Enrolled ${email}`)
      throw new UnauthorizedException("STUDENT ALREADY ENROLLED")
    }
    const update= await this.courseModel.findByIdAndUpdate(courseId,{ $push: { students: user._id } })
    this.logger.log(`STUDENT Enrolled EMAIL ${email}`)
    return {
      message: `STUDENT Enrolled EMAIL ${email}`
    }

  }


  

  async getAllCourses(): Promise<Course[]> {
    // return await this.courseModel.find({ isAvailable: true });
    return await this.courseModel.aggregate([
      {
        $match: { isAvailable: true } 
      },
      {
      $lookup: {
        from: 'users', // the collection to join with
        localField: 'userId', // field in Courses collection
        foreignField: '_id', // field in Users collection
        as: 'instructor_details' // the name of the resulting array
      }
      }
    ]);
}
async searchCoursesByTitle(title: string): Promise<Course[]> {
  if (!title || title.length < 2) {
    return [];
  }

  const searchCriteria = {
    $or: [
      {
        title: { $regex: `\\b${title}`, $options: 'i' }, // Match title
      },
      {
        keywords: { $in: [new RegExp(`^${title}`, 'i')] }, // Match any keyword starting with the given title
      }, {isAvailable:true}
    ]
  };

  return this.courseModel.find(searchCriteria).exec();
}

  async searchCourses(course: { title?: string; category?: string; level?: DifficultyLevel; keywords?: string[]; }): Promise<Course[]> {
    const searchCriteria: any = {};

    if (course.title) {
      searchCriteria.title = { $regex: course.title, $options: 'i' };
    }
    if (course.category) {
      searchCriteria.category = course.category;
    }
    if (course.level) {
      searchCriteria.level = course.level;
    }
    if (course.keywords && course.keywords.length > 0) {
      searchCriteria.keywords = { $in: course.keywords.map((kw) => new RegExp(kw, 'i')) };
    }

    return this.courseModel.find(searchCriteria).exec();
  }

  async getStudentsByInstructor(instructorId: string, courseId: string): Promise<User[]> {
    await this.validateInstructor(instructorId);

    const course = await this.courseModel.findOne({
      _id: new mongoose.Types.ObjectId(courseId),
      created_by: new mongoose.Types.ObjectId(instructorId),
    }).exec();

    if (!course) {
      throw new NotFoundException(`Course not found for instructor ${instructorId}`);
    }
    return this.userModel.find({ _id: { $in: course.students } }).exec();
  }

  async getInstructorByStudent(studentId: string, courseId: string): Promise<User> {
    await this.validateStudent(studentId);

    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const course = await this.courseModel.findOne({
      _id: new mongoose.Types.ObjectId(courseId),
      students: studentObjectId,
    }).exec();

    if (!course) {
      throw new NotFoundException(
        `No course found with ID "${courseId}" for the student with ID "${studentId}"`
      );
    }

    const instructor = await this.userModel.findById(course.created_by).exec();
    if (!instructor) {
      throw new NotFoundException(`Instructor not found for course with ID "${courseId}"`);
    }
    return instructor;
  }

  async getEnrolledCourses(studentId: string): Promise<Course[]> {
    if (!studentId || !mongoose.isValidObjectId(studentId)) {
      throw new BadRequestException('Invalid or missing student ID');
    }

    try {
      const courses = await this.courseModel.find({ students: studentId, isAvailable: true }).exec();
      if (!courses || courses.length === 0) {
        throw new NotFoundException(`No enrolled courses found for student ID: ${studentId}`);
      }
      return courses;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      throw new InternalServerErrorException('An error occurred while fetching enrolled courses');
    }
  }

  async getStudentEnrolledCourses(instructorId: string, studentId: string): Promise<Course[]> {
    const instructor = await this.userModel.findById(instructorId).exec();
    if (!instructor || (instructor.role !== 'instructor' && instructor.role !== 'admin')) {
      throw new BadRequestException('Only the course instructor or an admin can access this data.');
    }
    return this.getEnrolledCourses(studentId);
  }

  // PUT Methods
  async updateCourse(courseId: string, updateCourse: any, userId: string): Promise<Course> {
    await this.validateInstructor(userId);

    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if(String(course.userId) != userId){
      throw new UnauthorizedException('THIS COURSE IS NOT MADE BY THIS INSTRUCTOR')

    }


    const new_course = new this.courseModel({
      ...course.toObject(),
      ...updateCourse
      
          
    });


  new_course.versionNumber =course.versionNumber+1
  course.isAvailable = false
  new_course.isAvailable = true
  this.logger.log(updateCourse)
  this.logger.log("NEW"+new_course)
  this.logger.log("OLD"+course)

   await course.save()
   new_course._id = undefined;
   return  await new_course.save(); 

  }

  // DELETE Methods
  async deleteCourse(courseId: string, instructorId: ObjectId): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found.`);
    }
    const user=await this.userModel.findOne({_id:instructorId})
    if (course.userId != instructorId && user.role!= 'admin' ) {
      throw new ForbiddenException('Only the instructor who created this course can delete it');
    }
    
    if (course.isAvailable === false) {
      throw new BadRequestException(`Course with ID ${courseId} is already deleted
      `);
    }
    
    course.isAvailable = false;
    const updatedCourse = await course.save();
    return updatedCourse;
  }


  // Helper Methods
   async validateInstructor(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    if (user.role !== 'instructor') {
      throw new BadRequestException(
        `User with ID "${userId}" must be an instructor, but has "${user.role}"`
      );
    }
    return user;
  }

   async validateStudent(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    if (user.role !== 'student') {
      throw new BadRequestException(
        `User with ID "${userId}" must be a student, but has "${user.role}"`
      );
    }
    return user;
  }

  async addKeyword(courseId:mongoose.Schema.Types.ObjectId, keyword:string, instructorId:mongoose.Schema.Types.ObjectId) {
    const course = await this.courseModel.findById(courseId).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }
    if(course.userId != instructorId){
      throw new ForbiddenException('Only the instructor who created this course can add keywords');
    }
    if (!course.keywords.includes(keyword)) {
      course.keywords.push(keyword);
      await course.save();
    }
    return course;
  }

}



