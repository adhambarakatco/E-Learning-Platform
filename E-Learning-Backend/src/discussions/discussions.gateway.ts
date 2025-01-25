import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DiscussionsService } from './discussions.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ValidateIdDto } from './dto/validate-id-dto';

/*
  This gateway is responsible for handling the Discussion Forum for courses.

  POSTS:

  1)Post Creation: 

  -Only students can create posts in the forum, posts are broadcasted to all connected clients in the corresponding course room

  2)Post Deletion:

  1-Admins can delete any post in the forum
  2-Instructors can delete posts within the courses that they teach
  3-Students can delete their own posts only

  COMMENTS:

  1)Comment Creation:

  1-Both students and instructors can create comments on posts, comments are broadcasted to all connected clients in the corresponding post room
  2-Notifications are broadcasted to the post author about the new comment

  2)Comment Deletion:

  1-Admins can delete any comment in the forum
  2-Instructors can delete comments within the courses that they teach
  3-Students can delete their own comments only

*/


@WebSocketGateway({ cors: true, namespace: '/forum' })
export class DiscussionsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  // GATEWAY VARIABLES

  // Global server instance to emit events to all connected clients
  @WebSocketServer() server: Server;

  // Logger instance for testing and logging events
  private readonly logger = new Logger(DiscussionsGateway.name);

  // Injecting the discussions service to handle business logic
  constructor(private discussionsService: DiscussionsService) {}

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

  // POST EVENTS

  /*
  MAMDOUH:
  WE SHOULD USE GUARDS FOR POST CREATION TO CHECK THE ROLE OF THE USER
  ONLY STUDENTS CAN CREATE POSTS 
  */

  // Listen for new post creation
  @SubscribeMessage('post:create')
  async handleCreatePost(@ConnectedSocket() client: Socket, @MessageBody(new ValidationPipe()) payload: CreatePostDto) {
    try {

      // Handle the creation logic from the service
      const post = await this.discussionsService.createPost(payload);

      // Emit the created post to the corresponding course room of the post creator
      this.server.to(`course_${payload.course}`).emit('post:created', post);

      // Log the event for debugging
      this.logger.log(`Post created in course_${payload.course}`);

    } catch (error) {

      // Log error and emit error message to the client
      this.logger.error(`Error creating post: ${error.message}`, error.stack);
      client.emit('post:create:error', { message: 'Failed to create post', details: error.message });

    }
  }

  //***

  /*
   MAMDOUH:
   WE SHOULD USE GUARDS FOR POST DELETION TO CHECK THE ROLE OF THE USER
  */

  // Listen for post deletion
  @SubscribeMessage('post:delete')
  //@UseGuards(RolesGuard) (SHOULD USE A GUARD TO CHECK THE ROLE OF THE USER) (MAMDOOOOOO)
  async handleDeletePost(@ConnectedSocket() client: Socket, @MessageBody() { postId, role, userId }: { postId: string, role: string, userId: string }) {
    try {

      // Check the role of the user and call the corresponding service method
      let post;

      switch (role) {

        case 'admin':
          post = await this.discussionsService.deletePostAdmin(postId);
          break;

        case 'instructor':
          post = await this.discussionsService.deletePostInstructor(postId, userId);
          break;

        case 'student':
          post = await this.discussionsService.deletePostStudent(postId, userId);
          break;

        default:
          throw new Error('Unauthorized');

      }

      // Emit the deleted post to the corresponding course room of the post creator
      this.server.to(`course_${post.course}`).emit('post:deleted', post);

      // Log the event for debugging
      this.logger.log(`Post deleted in course_${post.course}`);

    } catch (error) {

      this.logger.error(`Error deleting post: ${error.message}`, error.stack);
      client.emit('post:delete:error', { message: 'Failed to delete post', details: error.message });

    }
  }

  //COMMENT EVENTS

  //***

  /*
  MAMDOUH:
  WE SHOULD USE GUARDS FOR COMMENT CREATION TO CHECK THE ROLE OF THE USER
 (BOTH STUDENTS AND INSTRUCTORS CAN CREATE COMMENTS)
  */

  // Listen for new comment creation
  @SubscribeMessage('comment:create')
  async handleCreateComment(@ConnectedSocket() client: Socket, @MessageBody(new ValidationPipe()) payload: CreateCommentDto) {
    try {

      // Handle the creation logic from the service
      const comment = await this.discussionsService.createComment(payload);

      // Emit the created comment to the corresponding post room of the comment creator
      this.server.to(`post_${payload.post}`).emit('comment:created', comment);

      // Log the event for debugging
      this.logger.log(`Comment created in post_${payload.post}`);

      // NOTIFICATION HANDLING FOR REPLY NOTIFICATIONS TO POST AUTHOR
      const post = await this.discussionsService.getPostById(payload.post);

      // Emit the notification only if the comment author is not the post author
      if(comment.author._id.toString() !== post.author._id.toString())
        {this.server.to(`user_${post.author}`).emit('notification', { message: 'You have a new reply to your post', data: post.title });}
    
      
     this.logger.log(`Post author: ${post.author.toString()}`);

    } catch (error) {
      // Log error and emit error message to the client
      this.logger.error(`Error creating comment: ${error.message}`, error.stack);
      client.emit('comment:create:error', { message: 'Failed to create comment', details: error.message });
    }
  }

  //*** 
   
  /*
   MAMDOUH:
   WE SHOULD USE GUARDS FOR COMMENT DELETION TO CHECK THE ROLE OF THE USER
  */

  // Listen for comment deletion
  @SubscribeMessage('comment:delete')
  async handleDeleteComment(@ConnectedSocket() client: Socket, @MessageBody() { commentId, role, userId }: { commentId: string, role: string, userId: string }) {
    try {

      // Check the role of the user and call the corresponding service method
      let comment;

      switch (role) {

        case 'admin':
          comment = await this.discussionsService.deleteCommentAdmin(commentId);
          break;

        case 'instructor':
          comment = await this.discussionsService.deleteCommentInstructor(commentId, userId);
          break;

        case 'student':
          comment = await this.discussionsService.deleteCommentStudent(commentId, userId);
          break;

        default:
          throw new Error('Unauthorized');

      }

      // Emit the deleted comment to the corresponding post room of the comment
      this.server.to(`post_${comment.post}`).emit('comment:deleted', comment);

      // Log the event for debugging
      this.logger.log(`Comment deleted in post_${comment.post}`);

    } catch (error) {

      // Log error and emit error message to the client
      this.logger.error(`Error deleting comment: ${error.message}`, error.stack);
      client.emit('comment:delete:error', { message: 'Failed to delete comment', details: error.message });

    }
  }

  // ROOM CONNECT/DISONNECT EVENTS

  // COURSE ROOMS

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
      client.emit('room:joined:course', { room: roomName, message: `You have joined the forum for course: ${courseId}`});

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
      client.emit('room:left:course', { room: roomName, message: `You have left the forum for course: ${courseId}`});

    }catch(error){

      // Log error and emit error message to the client
      this.logger.error(`Error leaving course room: ${error.message}`, error.stack);
      client.emit('room:leave:course:error', { message: 'Failed to leave course room', details: error.message });

    }
   
  }

  // POST ROOMS

  // Joining a post room for recieving comment updates for a specific post
  @SubscribeMessage('room:join:post')
  handleJoinPostRoom(@ConnectedSocket() client: Socket, @MessageBody(new ValidationPipe()) postId: ValidateIdDto) {
    try{

      // Obtain the room name from the post id
      const roomName = `post_${postId.id}`;

      // Join the room
      client.join(roomName);

      // Log the event for debugging
      this.logger.log(`Client ${client.id} joined post room ${roomName}`);

      // Emit a message to the client that they have joined the room
      client.emit('room:joined:post', { room: roomName, message: `You have joined post: ${postId}` });

    }catch(error){

      // Log error and emit error message to the client
      this.logger.error(`Error joining post room: ${error.message}`, error.stack);
      client.emit('room:join:post:error', { message: 'Failed to join post room', details: error.message });

    }
    
  }

  // Leaving a post room
  @SubscribeMessage('room:leave:post')
  handleLeavePostRoom(@ConnectedSocket() client: Socket, @MessageBody(new ValidationPipe()) postId: ValidateIdDto) {
    try{

      // Obtain the room name from the post id
      const roomName = `post_${postId.id}`;

      // Leave the room
      client.leave(roomName);

      // Log the event for debugging
      this.logger.log(`Client ${client.id} left post room ${roomName}`);

      // Emit a message to the client that they have left the room
      client.emit('room:left:post', { room: roomName, message: `You have left post: ${postId}` });

    }catch(error){

      // Log error and emit error message to the client
      this.logger.error(`Error leaving post room: ${error.message}`, error.stack);
      client.emit('room:leave:post:error', { message: 'Failed to leave post room', details: error.message });
      
    }
    
  }
  
  // USER ROOMS (FOR NOTIFICATIONS)

  @SubscribeMessage('room:join:user')
  handleJoinUserRoom(@ConnectedSocket() client: Socket, @MessageBody(new ValidationPipe()) userId: ValidateIdDto) {
    try {

      // Obtain the room name from the user id
      const roomName = `user_${userId.id}`;

      // Join the room
      client.join(roomName);

      // Log the event for debugging
      this.logger.log(`Client ${client.id} joined user room ${roomName}`);

      // Emit a message to the client that they have joined the room
      client.emit('room:joined:user', { room: roomName, message: `You have joined user room: ${userId.id}` });

    } catch (error) {

      // Log error and emit error message to the client
      this.logger.error(`Error joining user room: ${error.message}`, error.stack);
      client.emit('room:join:user:error', { message: 'Failed to join user room', details: error.message });

    }
  }

  // Leaving a user room for notifications
  @SubscribeMessage('room:leave:user')
  handleLeaveUserRoom(@ConnectedSocket() client: Socket, @MessageBody(new ValidationPipe()) userId: ValidateIdDto) {
    try {

      // Obtain the room name from the user id
      const roomName = `user_${userId.id}`;

      // Leave the room
      client.leave(roomName);

      // Log the event for debugging
      this.logger.log(`Client ${client.id} left user room ${roomName}`);

      // Emit a message to the client that they have left the room
      client.emit('room:left:user', { room: roomName, message: `You have left user room: ${userId.id}` });

    } catch (error) {

      // Log error and emit error message to the client
      this.logger.error(`Error leaving user room: ${error.message}`, error.stack);
      client.emit('room:leave:user:error', { message: 'Failed to leave user room', details: error.message });
      
    }
  }

  // SEARCH FUCNTIONALITY 

  // POSTS 

  // Search for posts by title
  @SubscribeMessage('search:post:title')
  async handleSearchPostByTitle(@ConnectedSocket() client: Socket, @MessageBody() query: string) {
    try {

      // Handle the search logic from the service
      const posts = await this.discussionsService.searchPostsTitle(query);

      // Emit the search results to the client
      client.emit('search:post:title:results', { message: 'Search results for posts by title', data: posts });

    } catch (error) {

      // Log error and emit error message to the client
      this.logger.error(`Error searching posts by title: ${error.message}`, error.stack);
      client.emit('search:post:title:error', { message: 'Failed to search posts by title', details: error.message });

    }
  }

  // Search for posts by content
  @SubscribeMessage('search:post:content')
  async handleSearchPostByContent(@ConnectedSocket() client: Socket, @MessageBody() query: string) {
    try {

      // Handle the search logic from the service
      const posts = await this.discussionsService.searchPostsContent(query);

      // Emit the search results to the client
      client.emit('search:post:content:results', { message: 'Search results for posts by content', data: posts });

    } catch (error) {

      // Log error and emit error message to the client
      this.logger.error(`Error searching posts by content: ${error.message}`, error.stack);
      client.emit('search:post:content:error', { message: 'Failed to search posts by content', details: error.message });

    }
  }
  

}
