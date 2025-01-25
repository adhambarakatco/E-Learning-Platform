import { Module } from '@nestjs/common';
import { CourseAnnouncementsService } from './course-announcements.service';
import { CourseAnnouncementsController } from './course-announcements.controller';
import { CourseAnnouncementsGateway } from './course-announcements.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import {CourseAnnouncementSchema } from './schema/course-announcement.schema';
import { LogsModule } from 'src/logging/logs.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'CourseAnnouncement', schema: CourseAnnouncementSchema }]), LogsModule],
  providers: [CourseAnnouncementsService, CourseAnnouncementsGateway],
  controllers: [CourseAnnouncementsController],
})
export class CourseAnnouncementsModule {}
