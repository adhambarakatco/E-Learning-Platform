import { Body, Controller, Delete, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { PlatformAnnouncementsService } from './platform-announcements.service';

@Controller('platform-announcements')
export class PlatformAnnouncementsController {

    constructor(private announcementsService: PlatformAnnouncementsService) {}

      /*
        Only 1 API endpoint is needed for the announcements module:

        1) Get all announcements by course

        The reason only this endpoint is needed is because as soon as soon as the user navigates to the platform announcements page ,previous announcements
        for should be displayed. The other services and the demonstration of any new announcements will be handled in the gateway since they will need to be handled in
        real time.

    */

    @Get()
    getAnnouncements() {
        return this.announcementsService.getAnnouncements();
    }
}




