import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseAnnouncement, CourseAnnouncementDocument } from './schema/course-announcement.schema';
import { CreateCourseAnnouncementDto } from './dto/create-course-announcement.dto';

@Injectable()
export class CourseAnnouncementsService {
    constructor(
        @InjectModel(CourseAnnouncement.name) private announcementModel: Model<CourseAnnouncementDocument>, 
    ) {}

    //CREATE ANNOUNCEMENT
    async createAnnouncement(createAnnouncementDto: CreateCourseAnnouncementDto): Promise<CourseAnnouncementDocument> {
        const createdAnnouncement = new this.announcementModel(createAnnouncementDto);
        return createdAnnouncement.save();
    }

    //GET PREVIOUS ANNOUNCEMENTS BY COURSE
    async getAnnouncementsByCourse(courseId: string): Promise<{ message: string, data: CourseAnnouncementDocument[] }> {

        // Find all announcements for the course and sort them by creation date
        const announcements = await this.announcementModel.find({ course: courseId }).sort({ createdAt:-1 }).exec();

        // If no announcements are found return a message saying so
        if (announcements.length === 0) 
            return { message: 'No announcements found for this course', data: [] };

        // Return the announcements
        return { message: 'Announcements found', data: announcements };

    }

    //DELETE ANNOUNCEMENT
    async deleteAnnouncement(announcementId: string): Promise<CourseAnnouncementDocument> {
        return this.announcementModel.findByIdAndDelete(announcementId);
    }
}