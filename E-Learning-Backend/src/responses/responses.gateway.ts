import { Logger } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    SubscribeMessage,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({ 
    cors: { 
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true 
    } 
  })
  export class ResponseGateway
    implements OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer()
    server: Server;
  
    private logger = new Logger('ResponseGateway');
    private userSockets: Map<string, string[]> = new Map();
    
    handleConnection(@ConnectedSocket() client: Socket) {
      this.logger.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(@ConnectedSocket() client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
      // Clean up user socket mapping
      for (const [userId, sockets] of this.userSockets.entries()) {
        const updatedSockets = sockets.filter(socketId => socketId !== client.id);
        if (updatedSockets.length === 0) {
          this.userSockets.delete(userId);
        } else {
          this.userSockets.set(userId, updatedSockets);
        }
      }
    }
  
    @SubscribeMessage('join:room')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
      client.join(userId);
      
      // Track user socket connections
      const userSockets = this.userSockets.get(userId) || [];
      userSockets.push(client.id);
      this.userSockets.set(userId, userSockets);
      
      this.logger.log(`User ${userId} joined room with socket ${client.id}`);
      
      // Send initial GPA if available

    }
  
    // Emit GPA update with improved logging
    sendGpaUpdate(userId: string, gpa: number) {
      this.logger.log(`Emitting GPA update for user ${userId}: ${gpa}`);
      this.server.to(userId).emit('gpaUpdated', { gpa });
    }
    
    @SubscribeMessage('gpaUpdated')
    handleGpaUpdate(client: Socket, data: { gpa: number }) {
      this.logger.log(`GPA updated: ${data.gpa}`);
    }
  }
  