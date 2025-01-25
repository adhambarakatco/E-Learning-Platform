import { Body, Controller, Delete, Get,Put, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateUserDTO } from './CreateUser.dto';
import { UsersService } from './users.service';
import {Role, User,UserDocument} from '../Schemas/users.schema'
import { LoginUserDTO } from './loginUser.dto';
import mongoose, { Model, ObjectId,Types } from 'mongoose';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../role/role.decorator';
import { RolesGuard } from '../role/role.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('students')
  async getStudents() {
    return this.usersService.getStudents();
  }


  @Get('instructors')
  async getInstructors() {
    return this.usersService.getInstructors();
  }


  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('allStudents')
 async getAllStudents() {
  console.log('all students')
     const students = await this.usersService.getAllStudents();
     return { data: students, message: 'Students fetched successfully' };
  
   }
 
  
@UseGuards(AuthGuard,RolesGuard)
@Roles(Role.Student, Role.Instructor)
  @Put('/editname')
  async updateUserName(
    @Body('name') newName: string, @Req() req: any
  ): Promise<User> {
    const objectId = new Types.ObjectId(req.user.sub);
    return this.usersService.updateUserName(objectId, newName);
  }

@Delete('deletemyself')
@UseGuards(AuthGuard, RolesGuard)  // Apply AuthGuard and RolesGuard
@Roles(Role.Student) // Allow Admin, Instructor, and Student roles
async DeleteMyself(@Req() req: any): Promise<User> {
  return await this.usersService.DeleteMyself(req.user.sub);
}
@Delete('deleteuser')
@UseGuards(AuthGuard, RolesGuard)  // Apply AuthGuard and RolesGuard
@Roles(Role.Admin)
async deleteUser(@Req() req: any,@Body('userId') userId: ObjectId): Promise<User> {
  const user=await this.usersService.getUserById(userId);
  if(user.setActive==false){
    throw new UnauthorizedException('User is already deleted')
  }
  return await this.usersService.deleteUser(req.user.sub,userId);
}
@UseGuards(AuthGuard)
@Get('me')
async getMe(userId:ObjectId): Promise<User> {
  return await this.usersService.getUserById(userId);
}
}