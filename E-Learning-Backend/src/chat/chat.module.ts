import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './gateways/chat.gateway';
import { Chat, ChatSchema } from '../Schemas/chat.schema';
import { Message, MessageSchema } from '../Schemas/message.schema';
import { User, UserSchema } from '../Schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([ 
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
