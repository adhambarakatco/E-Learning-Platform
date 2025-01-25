import { Module, UseGuards } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from '../Schemas/courses.schema';
import { VersioningService } from './versioning/versioning.service';
import { User, UserSchema } from '../Schemas/users.schema';
import { UserModule } from '../users/users.module';
import { LogsModule } from '../logging/logs.module'; 
import { RolesGuard } from '../role/role.guard'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Course', schema: CourseSchema },      
    ]),
    UserModule,  
    LogsModule,
  ],
  controllers: [CoursesController],
  providers: [
    CoursesService,   
    VersioningService, 
  ],
  exports: [
    CoursesService,  
    MongooseModule, 
  ],
})
export class CoursesModule {}
