import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { create } from 'domain';

@Injectable()
export class MessageService {

  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(createMessageDto: CreateMessageDto, senderId: number) {

    const { conversationId, text } = createMessageDto;

    // 
    if(!text.trim()) {
      throw new ConflictException("Message text cannot be empty");
    }


     // ১. conversation টি বিদ্যমান কিনা তা যাচাই করা
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    // ২. মেসেজ প্রেরক (sender) এই conversation-এর অংশ কিনা তা যাচাই করা
    const isParticipant = await this.prisma.participant.findFirst({
      where: {
        AND: [{ conversationId: conversationId }, { userId: senderId }],
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation.',
      );
    }


    // ৩. মেসেজ তৈরি এবং সংরক্ষণ করা
    const newMessage = await this.prisma.message.create({
      data: {
        text,
        senderId,
        conversationId,
      },
      include: {
        // প্রয়োজনে sender-এর তথ্যও fetch করতে পারেন
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {    
      success: true,
      message: "Message sent successfully.",
      data: {
        id: newMessage.id,
        text: newMessage.text,
        sender_name: newMessage.sender.name,
        conversationId: newMessage.conversationId,
      },
    }
  }

  // get all messages in a conversation
  async getMessages(conversationId: number, userId: number) {

    // ১. conversation টি বিদ্যমান কিনা তা যাচাই করা
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    // ২. মেসেজ প্রেরক (sender) এই conversation-এর অংশ কিনা তা যাচাই করা
    const isParticipant = await this.prisma.participant.findFirst({
      where: {
        AND: [{ conversationId: conversationId }, { userId: userId }],
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation.',
      );
    }

    // ৩. সমস্ত মেসেজ ফেচ করা
    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        conversationId: conversationId,
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender_name: msg.sender.name,
          createdAt: msg.createdAt,
        })),
      },
    };
  }
}
