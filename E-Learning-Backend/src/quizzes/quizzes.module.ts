import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from '../Schemas/quizzes.schema';
import { QuestionBank, QuestionBankSchema } from '../Schemas/QuestionBank.schema';
import { User, UserSchema } from '../Schemas/users.schema';
import { ModuleSchema } from 'src/Schemas/modules.schema';
import { LogsModule } from 'src/logging/logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema }, // Use `Quiz.name` instead of 'Quiz'
      { name: 'Module', schema: ModuleSchema },
      { name: QuestionBank.name, schema: QuestionBankSchema },
      { name: User.name, schema: UserSchema },
    ]),
    LogsModule,
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}