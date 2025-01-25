import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformAnnouncement,PlaformAnnouncementDocument } from './schema/platform-announcement.schema';
import { CreatePlatformAnnouncementDto } from './dto/create-platform-announcement.dto';

@Injectable()
export class PlatformAnnouncementsService {

    constructor(
        @InjectModel(PlatformAnnouncement.name) private announcementModel: Model<PlaformAnnouncementDocument>, 
    ) {}

    //CREATE ANNOUNCEMENT
    async createAnnouncement(createAnnouncementDto: CreatePlatformAnnouncementDto): Promise<PlaformAnnouncementDocument> {
        const createdAnnouncement = new this.announcementModel(createAnnouncementDto);
        return createdAnnouncement.save();
    }

    //GET  ALL PREVIOUS ANNOUNCEMENTS 
    async getAnnouncements(): Promise<{ message: string, data: PlaformAnnouncementDocument[] }> {

        // Find all announcements for the course and sort them by creation date
        const announcements = await this.announcementModel.find().sort({ createdAt: -1 });

        // If no announcements are found return a message saying so
        if (announcements.length === 0) 
            return { message: 'No announcements found for this course', data: [] };

        // Return the announcements
        return { message: 'Announcements found', data: announcements };

    }

    //DELETE ANNOUNCEMENT
    async deleteAnnouncement(announcementId: string): Promise< PlaformAnnouncementDocument> {
        return this.announcementModel.findByIdAndDelete(announcementId);
    }

}


    