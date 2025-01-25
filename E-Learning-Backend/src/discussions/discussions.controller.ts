import { Body, Controller, Delete, Get, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import { Role } from 'src/Schemas/users.schema';

@UseGuards(AuthGuard, RolesGuard)
@Controller('discussions')
export class DiscussionsController {
    constructor(private discussionsService: DiscussionsService) {}

    // 1) Get all posts by course
    @UseGuards(RolesGuard)
    @Roles(Role.Student, Role.Instructor)
    @Get('posts/:courseId')
    getPostsByCourse(@Param('courseId') courseId: string) {
        return this.discussionsService.getPostsByCourse(courseId);
    }

    // 2)Get all comments by post
    @UseGuards(RolesGuard)
    @Roles(Role.Student, Role.Instructor)
    @Get('comments/:postId')
    getCommentsByPost(@Param('postId') postId: string) {
        return this.discussionsService.getCommentsByPost(postId);
    } 
}
