import { Injectable, UnauthorizedException,Logger,NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role, User, UserDocument } from '../Schemas/users.schema';
import mongoose, { Model, ObjectId } from 'mongoose';
import { CreateUserDTO} from './CreateUser.dto';
import { LoginUserDTO } from './loginUser.dto';
import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Course, CourseDocument } from '../Schemas/courses.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    
  ) {} 
  async getUserByEmail(email:string):Promise<User | null>{
    const user = await this.userModel.findOne({email:email})
    
    if (!user){  
      return null
    }
    
    return user
  }
  async updateUserName(userId: Types.ObjectId, newName: string): Promise<User> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.name = newName;
    return user.save();
  }
  async getUserById(id:ObjectId):Promise<User>{
    const user = await this.userModel.findOne({_id:id})
    
    if (!user){  
       throw new NotFoundException('User not found');
    }
    user.password = null

    this.logger.log("User details fetched id:"+ user._id)
    
    return user
  }


  async getStudents(){
    return await this.userModel.aggregate([
      {
        $match: { 
          role: 'student', 
          setActive: true 
        }
      },
      {
        $lookup: {
          from: 'courses', 
          localField: 'enrolledCourses', 
          foreignField: '_id', 
          as: 'courses' 
        }
      }
    ]);
  }
  

  async getInstructors(){

    return await this.userModel.aggregate([
      {
        $match: { role: 'instructor' }  // Assuming 'role' field identifies instructors
      },
      {
        $lookup: {
          from: 'courses', 
          localField: '_id', 
          foreignField: 'userId', 
          as: 'courses' 
        }
      }
    ]);

  }

  async register(userData: CreateUserDTO): Promise<UserDocument> {
    try{
      const newUser = new this.userModel(userData);

      const savedUser= await newUser.save();
      this.logger.log(`User registered successfully: ${savedUser._id}`)
      return savedUser
    }
    catch(err){
      this.logger.error('Error during user registration', err.stack);
      throw err;

    }
  }
  async DeleteMyself(id:ObjectId):Promise<User>{
    const user = await this.userModel.findOne({_id:id})
    if (!user){
      throw new NotFoundException('User not found')
    }
 
    user.setActive = false
    const deletedUser = await user.save()
    return deletedUser
  }

  async getAllStudents(): Promise<User[]> {
    try {
      return await this.userModel.find({ role: Role.Student }).exec();
    } catch (error) {
      throw new Error(`Error fetching students: ${error.message}`);
    }
  }
  async deleteUser(idadmin:ObjectId,id:ObjectId):Promise<User>{
    const user = await this.userModel.findOne({_id:idadmin})
    if (!user){
      throw new NotFoundException('User not found')
    }
    const user2=await this.userModel.findOne({_id:id})
    if(!user2){
      throw new NotFoundException("student/instructor not found")
    }
     if(idadmin==id){
      throw new ForbiddenException('Admin cannot delete himself ')
    }
   if(user2.role=='instructor'){
      throw new ForbiddenException('Cannot delete instructor')
    }
    if(user2.role=='admin'){
      throw new ForbiddenException('Cannot delete admin')
    } 
   if(user2.setActive===false){
      throw new ForbiddenException('User already deleted')
    }
    user2.setActive=false
    const deletedUser=await user2.save()
    return deletedUser
  }
}
