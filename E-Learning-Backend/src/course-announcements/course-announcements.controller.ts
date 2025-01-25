import { Body, Controller, Delete, Get, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CourseAnnouncementsService } from './course-announcements.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/Schemas/users.schema';


@UseGuards(AuthGuard, RolesGuard)
@Controller('announcements')
export class CourseAnnouncementsController {
    constructor(private announcementsService: CourseAnnouncementsService) {}


    //GET ANNOUNCEMENTS BY COURSE
    @Roles(Role.Instructor,Role.Student)
    @Get(':courseId')
    getAnnouncementsByCourse(@Param('courseId') courseId: string) {
        return this.announcementsService.getAnnouncementsByCourse(courseId);
    }

}

