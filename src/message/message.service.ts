import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { create } from 'domain';
import { MessageGateway } from './message.gateway';

@Injectable()
export class MessageService {

  constructor(private readonly prisma: PrismaService,
              private readonly messageGateway: MessageGateway
  ) {}

  // Send a message in a conversation
  async sendMessage(createMessageDto: CreateMessageDto, senderId: number) {

    const { conversationId, text } = createMessageDto;

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

    this.messageGateway.handleNewMessage(newMessage);   

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

  // Update a message
  async updateMessage(
    messageId: number,
    updateMessageDto: UpdateMessageDto,
    userId: number,
  ) {
    const { text } = updateMessageDto;

    // ১. প্রথমে মেসেজটি খুঁজে বের করা
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    // ২. ব্যবহারকারী মেসেজের মালিক কিনা তা যাচাই করা
    if (message.senderId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this message.',
      );
    }

    // ৩. মেসেজটি আপডেট করা
    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: { text },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        conversation: {
          select: {
            id: true
          },
        },
      },
    });
    
    console.log("Updated Message:", updatedMessage);
    this.messageGateway.handleNewMessage(updatedMessage);

    return {
      success: true,
      message: 'Message updated successfully.',
      data: updatedMessage,
    };
  }

  // Delete a message
  async deleteMessage(messageId: number, userId: number) {
    // ১. প্রথমে মেসেজটি খুঁজে বের করা
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true, conversationId: true },
    });

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    // ২. ব্যবহারকারী মেসেজের মালিক কিনা তা যাচাই করা
    if (message.senderId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this message.',
      );
    }

    this.messageGateway.handleDeletedMessage(message);

    // ৩. মেসেজটি মুছে ফেলা
    await this.prisma.message.delete({
      where: { id: messageId },
    });
    return {
      success: true,
      message: 'Message deleted successfully.',
    };
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

  // get all conversation list
 

}
