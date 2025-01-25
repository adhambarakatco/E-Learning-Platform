import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Socket, Server } from 'socket.io';
import { MessageDto } from '../dto/message.dto';
import { ChatService } from "../chat.service";
import { Message } from "src/Schemas/message.schema";
import { GroupChatDto } from "../dto/groupchat.dto";
import { group } from "console";

@WebSocketGateway(3002, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server : Server;

    constructor(private readonly chatService : ChatService) {}
    
    handleConnection(client: Socket) {
        client.broadcast.emit('user-connected', {
            message: `New user connected ${client.id}`
        });
    }

    handleDisconnect(client: Socket) {
        this.server.emit('user-disconnected', {
            message: `User disconnected ${client.id}`
        });
    }

    @SubscribeMessage('newMessage')
    async handleNewMessage(@MessageBody() message : MessageDto){
        const success : Message = await this.chatService.createMessage(message);

        this.server.emit('reply', success);
    }

    @SubscribeMessage('getChat')
    async handelGetChat(client : Socket, @MessageBody() chat : any){
        try{
            const history = await this.chatService.getChat(chat);
            
            const reply = [];

            for(let message of history){
                reply.push(message.content);
            }

            this.server.emit('reply', reply);
        }
        catch(err){
            ;
        }
    }

    @SubscribeMessage('createGroup')
    async handleCreateGroup(client : Socket, groupChatDto : GroupChatDto){
        try{
            
            const success = await this.chatService.createGroup(groupChatDto);
            
            this.server.emit('reply', success);
        }
        catch(err){
            ;
        }
    }
}