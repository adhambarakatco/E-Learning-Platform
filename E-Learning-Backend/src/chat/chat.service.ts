import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from '../Schemas/chat.schema';
import { Message } from '../Schemas/message.schema';
import { User } from '../Schemas/users.schema'
import { MessageDto } from './dto/message.dto';
import { GroupChatDto } from './dto/groupchat.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private chatModel : Model<Chat>,
        @InjectModel(Message.name) private messageModel : Model<Message>,
        @InjectModel(User.name) private userModel : Model<User>
    ) {}

    async createMessage(messageDto : MessageDto): Promise<Message>{
        try{
            const message = plainToClass(MessageDto, messageDto);

            const { sender, chat, content } = message;

            let targetChat = await this.chatModel.findById(chat).exec();

            if(!targetChat){

                const receivingUser = await this.userModel.findById(chat).exec();

                const sendingUser = await this.userModel.findById(sender).exec();

                if(!receivingUser) throw new Error('Invalid chat or receiver id');

                const sortedUsers = [sender, chat].sort();

                if(receivingUser.role === 'admin' || sendingUser.role === 'admin')
                    throw new Error('Admin cannot send message');
                
                targetChat = await this.chatModel.findOne({
                    users: { $all: sortedUsers, $size: 2 },
                    chatType: 'private'
                });

                if(!targetChat){
                    targetChat = new this.chatModel({
                        users: sortedUsers,
                        messages: []
                    });

                    await targetChat.save();
                }

            }

            const newMessage = new this.messageModel({
                sender,
                chat: targetChat._id,
                content
            });

            const success = await newMessage.save();

            targetChat.messages.push(success._id);

            await targetChat.save();

            return success;
        }
        catch(err){
            throw new Error("Error creating message");
        }
    }

    async getChat(chat: any): Promise<Message[]>{
        const objectId = chat._id;


        const success = await this.chatModel.findById(objectId).exec();


        if(!success)throw new Error('Chat not found');

        const messages = await this.messageModel.find({ _id: { $in: success.messages } }).sort({ sentAt: -1 }).exec();
        
        return messages;
    }

    async createGroup(groupChatDto : GroupChatDto): Promise<Chat>{

        const { name , users } = groupChatDto;

        for(let user of users){

            const currentUser = await this.userModel.findById(user).exec();

            if(currentUser.role === 'admin' || currentUser.role === 'instructor')
                throw new Error('Group chats are for students only');
        }

        const existingGroup = await this.chatModel.findOne({
            users: { $all: users, $size: users.length },
            name: name
        });

        if(existingGroup) throw new Error('Group chat already exists');

        const success = new this.chatModel({
            name: name,
            users: users,
            chatType: 'group',
            messages: []
        });

        const result = await success.save();

        return result;
    }

}
