import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from 'src/Schemas/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsModule } from '../logging/logs.module';
import { Course, CourseSchema } from '../Schemas/courses.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    LogsModule,  // Import the LogsModule
  ],
  providers: [UsersService],  // Provides the UsersService for dependency injection
  controllers: [UsersController],  // Registers the UsersController for handling HTTP requests
  exports: [MongooseModule, UsersService],  // Exports MongooseModule and UsersService for other modules
})
export class UserModule {}