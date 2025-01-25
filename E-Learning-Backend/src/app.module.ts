import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesModule } from './notes/notes.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { ModulesModule } from './modules/modules.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { ResponsesModule } from './responses/responses.module';
import { ProgressModule } from './progress/progress.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { CourseAnnouncementsModule } from './course-announcements/course-announcements.module';
import { PlatformAnnouncementsModule } from './platform-announcements/platform-announcements.module';
import { AuthModule } from './auth/auth.module';
import { BackupService } from './backup/backup.service';
import { ChatModule } from './chat/chat.module';
import { QuestionBankModule } from './questionBank/questionBank.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ScheduleModule } from '@nestjs/schedule';
const uri:string="mongodb://127.0.0.1:27017/e-learning_db"


@Module({
  imports: [UserModule, CoursesModule, ModulesModule, QuizzesModule, ResponsesModule, ProgressModule,
  MongooseModule.forRoot(uri),
  DiscussionsModule,
  CourseAnnouncementsModule,
  PlatformAnnouncementsModule,NotesModule,ChatModule,AuthModule ,QuizzesModule,
    QuestionBankModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // URL path to access files
    }),
    ScheduleModule.forRoot(),
  ],
 
  controllers: [AppController],
  providers: [AppService, BackupService],

})
export class AppModule {}

