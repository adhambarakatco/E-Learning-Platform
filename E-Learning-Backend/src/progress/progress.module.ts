import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressSchema } from '../Schemas/progress.schema';
import { ResponseSchema } from 'src/Schemas/responses.schema';
import { CourseSchema } from 'src/Schemas/courses.schema';
import { ModuleSchema } from 'src/Schemas/modules.schema';
import { QuizSchema } from 'src/Schemas/quizzes.schema';
import { UserSchema } from 'src/Schemas/users.schema';
import { Rating, RatingSchema } from 'src/Schemas/ratings.schema';
import { LogsModule } from 'src/logging/logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Progress", schema: ProgressSchema }]),
    MongooseModule.forFeature([{ name: "Response", schema: ResponseSchema }]),
    MongooseModule.forFeature([{ name: "Course", schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: "Module", schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: "Quiz", schema: QuizSchema }]),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema}]),
    MongooseModule.forFeature([{ name: "Rating", schema: RatingSchema}]),
    LogsModule
  ],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [],
})
export class ProgressModule {}
