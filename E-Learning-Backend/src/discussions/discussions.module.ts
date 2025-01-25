import { Module } from '@nestjs/common';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsGateway } from './discussions.gateway';
import { CommentSchema } from './schemas/comment.schema';
import { PostSchema } from './schemas/post.Schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscussionsService } from './discussions.service';
import { UserModule } from 'src/users/users.module';
import { CoursesModule } from 'src/courses/courses.module';
import { LogsModule } from 'src/logging/logs.module';
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Comment', schema: CommentSchema },
            { name: 'Post', schema: PostSchema }, 
    ]),
    UserModule,
    CoursesModule,
    LogsModule
    ],
    controllers: [DiscussionsController],
    providers: [DiscussionsService,DiscussionsGateway],
    exports: [MongooseModule]
})
export class DiscussionsModule {}
