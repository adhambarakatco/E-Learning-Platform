import { Module } from '@nestjs/common';
import { PlatformAnnouncementsController } from './platform-announcements.controller';
import { PlatformAnnouncementsService } from './platform-announcements.service';
import { PlatformAnnouncementsGateway } from './platform-announcements.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformAnnouncementSchema } from './schema/platform-announcement.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'PlatformAnnouncement', schema: PlatformAnnouncementSchema }])],
  controllers: [PlatformAnnouncementsController],
  providers: [PlatformAnnouncementsService, PlatformAnnouncementsGateway]
})
export class PlatformAnnouncementsModule {}
