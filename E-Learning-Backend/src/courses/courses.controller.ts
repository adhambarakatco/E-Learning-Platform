import { Controller, Get, Post, Body, Param, Put, Delete, Query,Req, Res, BadRequestException, NotFoundException,Logger , UseGuards } from '@nestjs/common';
import { VersioningService } from './versioning/versioning.service';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, DifficultyLevel } from '../Schemas/courses.schema';
import { Role, User } from '../Schemas/users.schema';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { AuthGuard } from '../auth/auth.guard'
import mongoose from 'mongoose';
import { Roles } from '../role/role.decorator';
import { RolesGuard } from '../role/role.guard';

@Controller('courses')
export class CoursesController {
  private readonly logger = new Logger(CoursesController.name);
  constructor(
    private coursesService: CoursesService,
    private versioningService: VersioningService,
  ) {}

  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.Admin)
  @Get()
    async getAllCoursesAdmin(): Promise<Course[]> {
      console.log('all courses')
      console.log('all courses')    
      return this.coursesService.getAllCoursesAdmin();
    }

  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.Instructor)
  @Post('invite')
  async invite(@Body('courseId') courseId :string,@Body('email') email:string){
    this.logger.log(email)
    this.logger.log(courseId)

    return this.coursesService.inviteStudent(email,courseId)
  }

  @Post('create')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.Instructor)
  async createCourse(@Req() req: any, @Body() createCourseDto: CreateCourseDto) {
      const instructorId = req.user.sub; // Extract `sub` from JWT payload
      return await this.coursesService.createCourse(instructorId, createCourseDto);
  }
  
  @UseGuards(AuthGuard)
  @Post('enroll')
  async enrollStudent(@Body() enrollDto: EnrollStudentDto, @Req() req: any) {
    const { courseId} = enrollDto;
    return await this.coursesService.enrollInCourse(courseId,req.user.sub);
  }
  @UseGuards(AuthGuard)
  @Get('searchByTitle')
  async searchCoursesByTitle(@Query('title') title: string): Promise<Course[]> {
    return this.coursesService.searchCoursesByTitle(title);
  }
 
  @Get('Allcourses')
  async getAllCourses(): Promise<Course[]> {
    return this.coursesService.getAllCourses();
  }
  
  @UseGuards(AuthGuard)
  @Get('mycourses')
  async getCoursesForInsructor(@Req() req:any) {
    
    return this.coursesService.getCoursesForInstructor(req.user.sub);
  }
  @UseGuards(AuthGuard)
  @Get('search')
  async searchCourses(@Body('title') title?: string,@Body('category') category?: string,@Body('level') level?: DifficultyLevel): Promise<Course[]> {
    return this.coursesService.searchCourses({ title, category, level });
  }
  @UseGuards(AuthGuard)
  @Get('instructor/:instructorId/:courseId/students')
  async getStudentsByInstructor(
    @Param('instructorId') instructorId: string,
    @Param('courseId') courseId: string
  ): Promise<User[]> {
    return this.coursesService.getStudentsByInstructor(instructorId, courseId);
  }
  @UseGuards(AuthGuard)
  @Get('students/:studentId/:courseId/instructors')
  async getInstructorsByStudent(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string
  ): Promise<User> {
    return this.coursesService.getInstructorByStudent(studentId, courseId);
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  async getCourse(@Param('id') courseId: string) : Promise<Course[]> {
    return this.coursesService.getCourse(courseId);
  }
  
  @Get('enrolled/:studentId')
  async getEnrolledCourses(@Param('studentId') studentId: string): Promise<Course[]> {
    return this.coursesService.getEnrolledCourses(studentId);
  }
  
  @Get('enrolled/student/:instructorId/:studentId')
  async getStudentEnrolledCourses(
    @Param('instructorId') instructorId: string,
    @Param('studentId') studentId: string
  ): Promise<Course[]> {
    return this.coursesService.getStudentEnrolledCourses(instructorId, studentId);
  }
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.Instructor)
  @Put(':id')
  async updateCourse(
    @Param('id') courseId: string,
    @Body() updateCourseDto: any,
    @Req() req:any
  ): Promise<Course> {
    return this.coursesService.updateCourse(courseId, updateCourseDto, req.user.sub);
  }
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.Instructor,Role.Admin)
  @Delete('delete')
  async deleteCourse(
    @Body('courseId') courseId: string,
    @Req() req:any
  ): Promise<Course> {
    return this.coursesService.deleteCourse(courseId, req.user.sub);
  }
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.Instructor)
  @Post('keyword/:id')
  async addKeywords(
    @Param('id') courseId: mongoose.Schema.Types.ObjectId,
    @Body('keyword') keyword: string,
    @Req() req:any
  ): Promise<Course> {
    return this.coursesService.addKeyword(courseId, keyword, req.user.sub);
  }



}