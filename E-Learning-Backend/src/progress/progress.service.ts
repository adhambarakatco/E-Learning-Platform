import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress } from '../Schemas/progress.schema';
import { CreateProgressDto } from './dto/CreateProgress.dto';
import { Course } from 'src/Schemas/courses.schema';
import { Module } from 'src/Schemas/modules.schema';
import { Quiz } from 'src/Schemas/quizzes.schema';
import { User } from 'src/Schemas/users.schema';
import { Response } from 'src/Schemas/responses.schema';
import { Rating } from 'src/Schemas/ratings.schema';

@Injectable()
export class ProgressService {
    constructor(
        @InjectModel('Progress') private progressModel: Model<Progress>,
        @InjectModel('Response') private responsesModel: Model<Response>,
        @InjectModel('Course') private courseModel: Model<Course>,
        @InjectModel('Module') private moduleModel: Model<Module>,
        @InjectModel('Quiz') private quizModel: Model<Quiz>,
        @InjectModel('User') private userModel: Model<User>,
        @InjectModel('Rating') private ratingModel: Model<Rating>) {}

    /////////////////////////////////////  STUDENT APIS //////////////////////////////////////

    async createProgress(createProgressDto: CreateProgressDto): Promise<Progress> {
        const newProgress = new this.progressModel(createProgressDto);
        return await newProgress.save();
    }

    async getAvgCompletionPercentage(userId: string): Promise<number> {
        const progress = await this.progressModel.find({user_id: userId}).exec();
        const test = await this.progressModel.find().exec();
        ;
        ;
        if(!progress || progress.length === 0) {
            throw new NotFoundException("No records found for this user");
            return 0;
        }
        const percentages = progress.map(progress => progress.completion_percentage);
        const total = percentages.reduce((acc, curr) => acc + curr,0);
        const average = total / percentages.length;

        return average;
    }

    async getCompletionPercentageByCourse(studentId: string, courseId: string): Promise<number[]> {
        const modules = await this.moduleModel.find({ course_id: courseId }).exec();
        const modulesJSON = JSON.parse(JSON.stringify(modules));
        const moduleIds = modulesJSON.map(module => module._id);
        if(modulesJSON.length === 0){
            throw new NotFoundException("This course has no modules")
        }

        const quizzes = await this.quizModel.find({ module_id: { $in: moduleIds }}).exec();
        const quizzesJSON = JSON.parse(JSON.stringify(quizzes));
        const quizIds = quizzesJSON.map(quiz => quiz._id);
        if(quizzesJSON.lenght === 0){
            throw new NotFoundException("This module has no quizzes")
        }

        const responses = await this.responsesModel.find({ quiz_id: { $in: quizIds}}).exec();
        const responsesJSON = JSON.parse(JSON.stringify(responses));
        const scores = responsesJSON.map(response => response.score);
        if(responsesJSON.lenght === 0){
            throw new NotFoundException("This quiz has no responses")
        }
        const sum = scores.reduce((acc,val) => acc + val, 0);
        const averageScore = sum / scores.length;
        return [averageScore];
    }

    async getAverageScoresAllCourses(studentId: string): Promise<any> {
        const responses = await this.responsesModel.find({ user_id: studentId }).exec();
        const responsesJSON = JSON.parse(JSON.stringify(responses));
        if(responsesJSON.length === 0){
            throw new NotFoundException("This student doesn't have any responses saved (FK problem)")
        }
        
        const quizIds = responsesJSON.map(response => response.quiz_id);
        const quizzes = await this.quizModel.find({ _id: { $in: quizIds } }).exec();
        const quizzesJSON = JSON.parse(JSON.stringify(quizzes));
        if(quizzesJSON.length === 0){
            throw new NotFoundException("This quiz id cannot be found in the Quizzes collection (FK problem)")
        }

        const moduleIds = quizzesJSON.map(quiz => quiz.module_id);
        const modules = await this.moduleModel.find({ _id: {$in: moduleIds} }).exec();
        const modulesJSON = JSON.parse(JSON.stringify(modules))
        if(modulesJSON.length === 0){
            throw new NotFoundException("This module id cannot be found in the module collection (FK problem)")
        }

        const courseIds = modulesJSON.map(module => module.course_id);
        const courses = await this.courseModel.find({ _id: { $in: courseIds } }).exec();
        if(courses.length === 0){
            throw new NotFoundException("This course id cannot be found in the course collection (FK problem)")
        }

        const courseScores = [];
        courses.forEach(course => {
            const courseModules = modulesJSON.filter(module => module.course_id == course._id);
            const moduleIds = courseModules.map(module => module._id);
            const courseQuizzes = quizzesJSON.filter(quiz => moduleIds.includes(quiz.module_id));
            const quizIds = courseQuizzes.map(quiz => quiz._id);
            const courseResponses = responsesJSON.filter(response => quizIds.includes(response.quiz_id));
            const scores = courseResponses.map(response => response.score);
            const totalScore = scores.reduce((acc, curr) => acc + curr, 0);
            const averageScore = totalScore / scores.length;
            courseScores.push({course: course.title, averageScore: averageScore});
        });

        let response = {
            student:{},
            courseScores: courseScores
        };

        const student = await this.userModel.findOne({ _id: studentId }).exec();
        const gpa = student.gpa;

        response.student = { id: studentId, gpa: gpa};
    
        return response;
    }

    async getEngagementTrend(studentId: string, courseId: string): Promise<any> {
        const modules = await this.moduleModel.find({course_id: courseId}).exec();
        const modulesJSON = JSON.parse(JSON.stringify(modules));
        const moduleIds = modulesJSON.map(module => module._id);
        if(modulesJSON.length === 0){
            throw new NotFoundException("No modules with this course id were found")
        }
        
        const allQuizzes = await this.quizModel.find({module_id: {$in: moduleIds}}).exec();
        const allQuizzesJSON = JSON.parse(JSON.stringify(allQuizzes));
        const quizIds = allQuizzesJSON.map(quiz => quiz._id);
        if(allQuizzesJSON.length === 0){
            throw new NotFoundException("No quizzes were found for this module")
        }

        const totalQuizzes = quizIds.length;
        let  matched = 0;

        quizIds.forEach( async quiz => {
            const matchTest = await this.responsesModel.find({ quiz_id: quiz }).exec();
            if(matchTest.length !== 0){
                matched++;
            }
        });

        const quizzesLeft = totalQuizzes - matched;
        
        return {"quizzesLeft":quizzesLeft};
    }

    async rateInstructor(studentId: string, courseId: string, rating: number): Promise<Rating> {
        const course = await this.courseModel.findOne({ _id: courseId }).exec();
        const instructor = await this.userModel.findOne({ _id: course.created_by}).exec();
        if(instructor === null){
            throw new NotFoundException("This course has no instructor");
        }

        const totalModules = await this.moduleModel.countDocuments({ course_id: courseId }).exec();

        const responses = await this.responsesModel.find({ user_id: studentId });
        const responsesJSON = JSON.parse(JSON.stringify(responses));
        if(responsesJSON.length === 0){
            throw new NotFoundException("This student doesn't have any responses saved (FK problem)")
        }

        const quizIds = responsesJSON.map(response => response.quiz_id);
        const quizzes = await this.quizModel.find({ _id: { $in: quizIds } }).exec();
        const quizzesJSON = JSON.parse(JSON.stringify(quizzes));
        if(quizzesJSON.length === 0){
            throw new NotFoundException("This quiz id cannot be found in the Quizzes collection (FK problem)")
        }

        const moduleIds = quizzesJSON.map(quiz => quiz.module_id)
        const modulesDone = await this.moduleModel.countDocuments({ _id: { $in: moduleIds }, course_id: courseId}).exec();

        if(totalModules != modulesDone){
            throw new BadRequestException("Student has not finished the course yet");
        }

        const insertion = {
            rating: rating,
            rater_id: studentId,
            ratee_id: instructor._id
        };

        return await this.ratingModel.create(insertion);
        
    }

    async rateModule(studentId: string, moduleId: string, rating: number): Promise<Rating> {
        const module = await this.moduleModel.findOne({ _id: moduleId }).exec();
        ;
        if(module === null){
            throw new NotFoundException("No record of this module was found");
        }

        const insertion = {
            rating: rating,
            rater_id: studentId,
            module_id: moduleId
        };

        return await this.ratingModel.create(insertion);

    }

    //////////////////////////////////////  INSTRUCTOR APIS //////////////////////////////////////

    async getAverageScores(instructorId: string): Promise<any[]> {
        const courses = await this.courseModel.find({ created_by: instructorId }).exec();
        const coursesJSON = JSON.parse(JSON.stringify(courses));
        const coursesArray = coursesJSON.map(course => [course.title, course._id]);
        if (coursesJSON.length === 0) {
            throw new NotFoundException("This instructor does not have any courses");
        }
    
        let averageScores = [];
    
        for (const course of coursesArray) {
            const modules = await this.moduleModel.find({ course_id: course[1] }).exec();
            const modulesJSON = JSON.parse(JSON.stringify(modules));
            const moduleIds = modulesJSON.map(module => module._id);
            
            if (modulesJSON.length === 0) {
                throw new NotFoundException("This course has no modules");
            }
    
            const quizzes = await this.quizModel.find({ module_id: { $in: moduleIds } }).exec();
            const quizzesJSON = JSON.parse(JSON.stringify(quizzes));
            const quizIds = quizzesJSON.map(quiz => quiz._id);
    
            if (quizzesJSON.length === 0) {
                ;
                continue;
            }
    
            const responses = await this.responsesModel.find({ quiz_id: { $in: quizIds } }).exec();
            const responsesJSON = JSON.parse(JSON.stringify(responses));
            const scores = responsesJSON.map(response => response.score);
    
            if (responsesJSON.length === 0) {
                ;
                continue;
            }
    
            const sum = scores.reduce((acc, val) => acc + val, 0);
            const averageScore = sum / scores.length;
            averageScores.push({ course: course[0], avg: averageScore });
        }
    
        ;
    
        return averageScores;
    }
    

    async getStudentEngagementReport(courseId: string): Promise<any> {
        const studentsCount = await this.progressModel.countDocuments({ course_id: courseId }).exec();

        const completionCount = await this.progressModel.countDocuments({ course_id: courseId, completion_percentage: 100 }).exec();

        const enrolled = await this.progressModel.find({ course_id: courseId}).exec();
        const enrolledJSON = JSON.parse(JSON.stringify(enrolled));
        const enrolledIds = enrolledJSON.map(enrolled => enrolled.user_id);

        const enrolledBelowAvg = await this.userModel.countDocuments({ _id: { $in: enrolledIds }, gpa: { $lt: 2 } });
        const enrolledAvg = await this.userModel.countDocuments({ _id: { $in: enrolledIds }, gpa: { $gte: 2, $lt: 3 } });
        const enrolledAboveAvg = await this.userModel.countDocuments({ _id: { $in: enrolledIds }, gpa: { $gte: 3 } })

        const modules = await this.moduleModel.find({ course_id: courseId }).exec();
        const modulesJSON = JSON.parse(JSON.stringify(modules));
        const moduleIds = modulesJSON.map(module => module._id);
        if(modulesJSON.length === 0){
            throw new NotFoundException("This course has no modules")
        }

        const quizzes = await this.quizModel.find({ module_id: { $in: moduleIds }}).exec();
        const quizzesJSON = JSON.parse(JSON.stringify(quizzes));
        const quizIds = quizzesJSON.map(quiz => quiz._id);
        if(quizzesJSON.lenght === 0){
            throw new NotFoundException("This module has no quizzes")
        }

        const responses = await this.responsesModel.find({ quiz_id: { $in: quizIds}}).exec();
        const responsesJSON = JSON.parse(JSON.stringify(responses));
        const scores = responsesJSON.map(response => response.score);
        if(responsesJSON.lenght === 0){
            throw new NotFoundException("This quiz has no responses")
        }

        const sum = scores.reduce((acc,val) => acc + val, 0);
        const averageScore = sum / scores.length;

        const report = {
            "Number of enrolled students": {
                "Total": studentsCount,
                "Below Average": enrolledBelowAvg,
                "Average": enrolledAvg,
                "Above Average": enrolledAboveAvg
            },
            "Number of students who completed the course": completionCount,
            "Average Score": averageScore
        }

        console.log(report)

        return report;
    }

    async getCourseRatings(courseId: string): Promise<any> {
        const modules = await this.moduleModel.find({ course_id: courseId }).exec();
        const modulesJSON = JSON.parse(JSON.stringify(modules));
        const moduleIds = modulesJSON.map(module => module._id);

        const ratings = await this.ratingModel.find({ module_id: { $in: moduleIds }});
        const ratingsJSON = JSON.parse(JSON.stringify(ratings));
        const scores = ratingsJSON.map(rating => rating.rating);

        const sum = scores.reduce((acc, cur) => acc = acc + cur, 0);
        const averageRating = sum/scores.length;

        const course = await this.courseModel.findOne({ _id: courseId }).exec();
        console.log(course)
        const courseTitle = course.title;
        console.log('hello', courseTitle)

        const response = {
            course_id: courseId,
            course_title: courseTitle,
            averageRating: averageRating
        }

        return response;
    }
}
