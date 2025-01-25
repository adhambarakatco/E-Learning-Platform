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
import { CourseAnnouncementsService } from './course-announcements.service';
import { CreateCourseAnnouncementDto } from './dto/create-course-announcement.dto';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ValidateIdDto } from 'src/discussions/dto/validate-id-dto';
import { CourseAnnouncement, CourseAnnouncementDocument } from './schema/course-announcement.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// ANY ACTION CREATION/DELETION IS RESTRICTED TO INSTRUCTORS ONLY

/*
  This gateway is responsible for handling Instructor created Course specific announcements.
  
    1) Announcement Creation:
  
    1-Created Announcements are broadcasted to all connected clients in the corresponding course room
    2-Notifications are broadcasted to all connected clients in the corresponding course room about the new announcement
  
    2) Announcement Deletion:
  
    -Deleted Announcements are broadcasted to all connected clients in the corresponding course room
*/


@WebSocketGateway({ cors: true, namespace: '/ws/course/announcement' })
export class CourseAnnouncementsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  // Global server instance to emit events to all connected clients
  @WebSocketServer() server: Server;

  // Logger instance for testing and loggin events
  private readonly logger = new Logger(CourseAnnouncementsGateway.name);

  // Injecting the announcements service to handle the business logic
  constructor(private readonly announcementsService: CourseAnnouncementsService,
    @InjectModel(CourseAnnouncement.name) private announcementModel: Model<CourseAnnouncementDocument>, 
    
  ) {}


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
  // CREATE ANNOUNCEMENT (EXPLICITELY FOR INSTRUCTORS)
  // NEED A GUARD (MAMDOUH) TO CHECK IF THE USER IS AN INSTRUCTOR
  
  @SubscribeMessage('announcement:create')
  async handleCreateAnnouncement(@ConnectedSocket() client: Socket, @MessageBody(new ValidationPipe()) payload: CreateCourseAnnouncementDto) {
    try {

      // Handle the creation logic from the service
      const announcement = await this.announcementsService.createAnnouncement(payload);
      
      
      // Populate Course Details
      const populatedAnnouncement = await this.announcementModel.findById(announcement).populate('course').exec();
      const courseName = populatedAnnouncement.course.title;

      // Emit the created post to the corresponding course room of the post creator
      this.server.to(`course_${payload.course}`).emit('announcement:created', announcement);

     client.to(`course_${payload.course}`).emit('notification', { message: `New course announcement created in ${courseName}`, data: announcement.content });

      // Log the event for debugging
      this.logger.log(`Announcement created in course_${payload.course}`);

    } catch (error) {

      // Log error and emit error message to the client
      this.logger.error(`Error creating announcement: ${error.message}`, error.stack);
      client.emit('announcement:create:error', { message: 'Failed to create announcement', details: error.message });

    }
  }

  // ***
  // DELETE ANNOUNCEMENT (EXPLICITELY FOR INSTRUCTORS)
  // NEED A GUARD (MAMDOUH) TO CHECK IF THE USER IS AN INSTRUCTOR

  @SubscribeMessage('announcement:delete')
  async handleDeleteAnnouncement(@ConnectedSocket() client: Socket,@MessageBody() announcementId: string){
    try{

      // Handle the deletion logic from the service
      const announcement = await this.announcementsService.deleteAnnouncement(announcementId);

      // Emit the deleted post to the corresponding course room of the post creator
      this.server.to(`course_${announcement.course}`).emit('announcement:deleted', announcement);

      // Log the event for debugging
      this.logger.log(`Announcement deleted in course_${announcement.course}`);

    }catch(error){

      // Log error and emit error message to the client
      this.logger.error(`Error deleting announcement: ${error.message}`, error.stack);
      client.emit('announcement:delete:error', { message: 'Failed to delete announcement', details: error.message });

    }
  }
  

  //HANDLING COURSE ROOMS

  // Joining a course room for recieving post updates for a specific course
  @SubscribeMessage('room:join:course')
  handleJoinCourseRoom(@ConnectedSocket() client: Socket, @MessageBody(new ValidationPipe) courseId: ValidateIdDto) {
    try{
      
      // Obtain the room name from the course id
      const roomName = `course_${courseId.id}`;

      // Join the room
      client.join(roomName);

      // Log the event for debugging
      this.logger.log(`Client ${client.id} joined course room ${roomName}`);

      // Emit a message to the client that they have joined the room
      client.emit('room:joined:course', { room: roomName, message: `You have joined the forum for course: ${courseId.id}`});

    }catch(error){
      
      // Log error and emit error message to the client
      this.logger.error(`Error joining course room: ${error.message}`, error.stack);
      client.emit('room:join:course:error', { message: 'Failed to join course room', details: error.message });

    }
    
  }

  // Leaving a course room
  @SubscribeMessage('room:leave:course')
  handleLeaveCourseRoom(@ConnectedSocket() client: Socket, @MessageBody(new ValidationPipe()) courseId: ValidateIdDto) {
    try{

      // Obtain the room name from the course id
      const roomName = `course_${courseId.id}`;

      // Leave the room
      client.leave(roomName);

      // Log the event for debugging
      this.logger.log(`Client ${client.id} left course room ${roomName}`);

      // Emit a message to the client that they have left the room
      client.emit('room:left:course', { room: roomName, message: `You have left the forum for course: ${courseId.id}`});

    }catch(error){

      // Log error and emit error message to the client
      this.logger.error(`Error leaving course room: ${error.message}`, error.stack);
      client.emit('room:leave:course:error', { message: 'Failed to leave course room', details: error.message });

    }
   
  }

}