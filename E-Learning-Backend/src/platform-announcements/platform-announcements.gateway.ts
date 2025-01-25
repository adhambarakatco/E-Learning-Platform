import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlatformAnnouncementsService } from './platform-announcements.service';
import { CreatePlatformAnnouncementDto } from './dto/create-platform-announcement.dto';
import { ValidationPipe, Logger } from '@nestjs/common';

// ANY ACTION CREATION/DELETION IS RESTRICTED TO ADMINS ONLY

/*
 This gateway is responsible for handling Admin created platform announcements.

  1) Announcement Creation:

  1-Created Announcements are broadcasted to all connected clients (including the creator)
  2-Notifications are broadcasted to all connected clients about the new announcement (excluding the creator)

  2) Announcement Deletion:

  -Deleted Announcements are broadcasted to all connected clients

*/

@WebSocketGateway({ cors: true, namespace: '/ws/platform/announcement' })
export class PlatformAnnouncementsGateway implements OnGatewayConnection, OnGatewayDisconnect{
  
  // Global server instance to emit events to all connected clients
  @WebSocketServer() server: Server;

  // Logger instance for testing and loggin events
  private readonly logger = new Logger(PlatformAnnouncementsGateway.name);

  // Injecting the announcements service to handle the business logic
  constructor(private readonly announcementsService: PlatformAnnouncementsService) {}


  // CONNECT/DISCONNECT EVENTS

  // Connection event
  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { message: 'Welcome to the Discussion Forum' });
  }

  // Disconnection event
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ***
  // CREATE PLATFORM ANNOUNCEMENT (EXPLICITELY FOR ADMINS)
  // NEED A GUARD (MAMDOUH) TO CHECK IF THE USER IS AN ADMIN
  
  @SubscribeMessage('platform-announcement:create')
  async handleCreateAnnouncement(@ConnectedSocket() client: Socket, @MessageBody(new ValidationPipe()) payload: CreatePlatformAnnouncementDto) {
    try {

      // Handle the creation logic from the service
      const announcement = await this.announcementsService.createAnnouncement(payload);

      // Emit the created platform announcement to all connected clients (including the creator)
      this.server.emit('platform-announcement:created', announcement);

      // Emit a notification to all connected clients about the new platform announcement (excluding the creator)
      client.broadcast.emit('notification', { message: `There is a new Platform Announcement:`, data: announcement.content });

      // Log the event for debugging
      this.logger.log(`Platform Announcement created`);

    } catch (error) {

      // Log error and emit error message to the client
      this.logger.error(`Error creating announcement: ${error.message}`, error.stack);
      client.emit('platform-announcement:create:error', { message: 'Failed to create platform announcement', details: error.message });

    }
  }

  // ***
  // DELETE ANNOUNCEMENT (EXPLICITELY FOR ADMIN)
  // NEED A GUARD (MAMDOUH) TO CHECK IF THE USER IS AN ADMIN

  @SubscribeMessage('platform-announcement:delete')
  async handleDeleteAnnouncement(@ConnectedSocket() client: Socket,@MessageBody() announcementId: string){
    try{

      // Handle the deletion logic from the service
      const announcement = await this.announcementsService.deleteAnnouncement(announcementId);

      // Emit the deleted post to all connected clients
      this.server.emit('platform-announcement:deleted', announcement);

      // Log the event for debugging
      this.logger.log(`Platform Announcement deleted`);

    }catch(error){

      // Log error and emit error message to the client
      this.logger.error(`Error deleting announcement: ${error.message}`, error.stack);
      client.emit('announcement:delete:error', { message: 'Failed to delete announcement', details: error.message });

    }
  }
  

}
