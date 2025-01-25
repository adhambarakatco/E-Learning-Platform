import { Body, Controller, Post, Get, UsePipes, ValidationPipe, HttpException, HttpStatus, Query, UseGuards, Req } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/CreateProgress.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../role/role.guard';
import { Roles } from '../role/role.decorator';
import { Role } from '../Schemas/users.schema';

@Controller('progress')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe())
export class ProgressController {
    constructor(private progressService: ProgressService) {}

    //////////////////////////////////////  STUDENT APIS //////////////////////////////////////

    @Post()
    @Roles(Role.Student)
    createProgress(@Body() createProgressDto: CreateProgressDto) {
        return this.progressService.createProgress(createProgressDto);
    }

    @Get('/averageCompletionPercentage')
    @Roles(Role.Student)
    async getAvgCompletionPercentage(@Req() req: any) {
        try {
        const userId = req.user.sub;
        ;
        const average = await this.progressService.getAvgCompletionPercentage(userId);
        ;
        return average;
        } catch (error) {
            ;
            return error;
        }
        
    }

    @Get('/courseId')
    @Roles(Role.Student)
    async getCompletionPercentageByCourse(@Query('courseId') courseId: string, @Req() req: any) {
        console.log('courseId', courseId);
        const userId = req.user.sub;
        const percentage = await this.progressService.getCompletionPercentageByCourse(userId, courseId);
        if(!percentage == null) {
            throw new HttpException('No progress found for this course', HttpStatus.NOT_FOUND);
        } 
        return percentage;
    }

    @Get('/averageScores/student')
    @Roles(Role.Student)
    async getAverageScoresAllCourses(@Req() req: any) {
        const averageScores = await this.progressService.getAverageScoresAllCourses(req.user.sub);
        if(averageScores.length === 0) {
            
            throw new HttpException('No average scores found for this user', HttpStatus.OK);
        }
        return averageScores;
    }

    //get the number of quizzes that are left for the student to solve by course
    @Get('/engagement')
    @Roles(Role.Student)
    async getEngagementTrend(@Query('courseId') courseId: string, @Req() req: any) {
        const engagement = await this.progressService.getEngagementTrend(req.user.sub, courseId);
        if(engagement === null) {
            throw new HttpException('No engagement trends found for this user', HttpStatus.OK);
        }
        return engagement;
    }

    @Post('/rate-instructor')
    @Roles(Role.Student)
    async rateInstructor(@Req() req: any, @Body('courseId') courseId: string, @Body('rating') rating: number) {
        return await this.progressService.rateInstructor(req.user.sub, courseId, rating);
    }

    @Post('/rate-module')
    @Roles(Role.Student)
    async rateModule(@Req() req: any, @Body('moduleId') moduleId: string, @Body('rating') rating: number) {
        return await this.progressService.rateModule(req.user.sub, moduleId, rating);
    }

    @Get('/course-rating')
    @Roles(Role.Instructor)
    async getCourseRatings(@Query('courseId') courseId: string) {
        const response = await this.progressService.getCourseRatings(courseId);
        if(response === null) {
            throw new HttpException("No ratings found for this course", HttpStatus.NOT_FOUND);
        }
        return response;
    }

    //////////////////////////////////////  INSTRUCTOR APIS //////////////////////////////////////

    @Get('averageScore/instructor')
    @Roles(Role.Instructor)
    async getAverageScores(@Req() req: any){
        const engagements = await this.progressService.getAverageScores(req.user.sub);
        if(engagements.length === 0){
            throw new HttpException('No courses found', HttpStatus.NOT_FOUND);
        }
        return engagements;
    }

    @Get('/studentEngagementReport')
    @Roles(Role.Instructor)
    async getStudentEngagementReport(@Query('courseId') courseId: string){
        const report = await this.progressService.getStudentEngagementReport(courseId);
        if(report === null){
            throw new HttpException('No report was found for this course', HttpStatus.NOT_FOUND);
        }
        return report;
    }

}
