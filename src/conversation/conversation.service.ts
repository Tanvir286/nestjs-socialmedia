import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupConversationDto } from './dto/update-group-conversation.dto';

@Injectable()
export class ConversationService {

  constructor(private readonly prisma: PrismaService) {}

  // start one-to-one conversation
  async createSingleMessage(userId: number, friendId: number) {


      // ১. ইউজার নিজের সাথে conversation শুরু করতে পারবে না
      if(userId === friendId) {
        throw new ConflictException("You cannot start a conversation with yourself");
      }

      //২. তারা বন্ধু কিনা তা যাচাই করা
      const isFriend = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      if (!isFriend) {
        throw new ConflictException("You can only message your friends.");
      }

      // ৩. দুই ইউজারের মধ্যে ইতোমধ্যে কোনো conversation আছে কিনা তা খোঁজা
      const existingConversation = await this.prisma.conversation.findFirst({
        where: {
          AND: [
            // এই অতিরিক্ত কন্ডিশনটি নিশ্চিত করবে যে এটি একটি গ্রুপ চ্যাট নয়
            { participants: { some: { userId: userId } } },
            { participants: { some: { userId: friendId } } },
          ],
        },
        include: {
          participants: { include: { user: true } },
        },
      });


      if (existingConversation) {
        return {
          success: true,
          message: "Existing conversation found.",
          data: existingConversation,
        };
    }

    // create new conversation
    const newConversation = await this.prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: userId },   // এটি হলো { userId } এর পূর্ণরূপ
            { userId: friendId },
          ],
        },
      },
      include: {
        participants: { include: { user: true } },
      },
    });

    return {
      success: true,
      message: "New conversation started.",
      data: newConversation,
    }
  }

  // start one-to-many conversation (group)
  async createGroup(dto: CreateGroupDto, creatorId: number) {

    const { groupName, participantIds } = dto;

    //
    if(groupName.trim().length === 0) {
      throw new ConflictException("Group name cannot be empty");
    }

    const allParticipantIds = [...new Set([creatorId, ...participantIds])];

    const uniqueParticipantIds = [...new Set(allParticipantIds)];

    if (uniqueParticipantIds.length < 2) {
      throw new ConflictException('A group must have at least 2 members.');
    }

    const usersCount = await this.prisma.user.count({
      where: {
        id: {
          in: uniqueParticipantIds,
        },
      },
    });


    if (usersCount !== uniqueParticipantIds.length) {
      throw new BadRequestException('One or more participant IDs are invalid.');
    }


    const newGroupConversation = await this.prisma.conversation.create({
      data: {
        groupName: groupName,
        groupAdminId: creatorId,
        isGroup: true,
        participants: {
          create: uniqueParticipantIds.map( participantUserId => ({
            userId: participantUserId,
            // যে গ্রুপ তৈরি করছে তাকে ADMIN বানানো হচ্ছে
            role: participantUserId === creatorId ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return {
      success: true,
      message: 'Group conversation created successfully.',
      data: newGroupConversation,
    };
  }

  // update group info
  async updateGroup(conversationId: number, dto: UpdateGroupConversationDto, userId: number) {

    const { groupName } = dto;


    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || !conversation.isGroup) {
      throw new BadRequestException('Group conversation not found.');
    }


    if (conversation.groupAdminId !== userId) {
      throw new BadRequestException('Only the group admin can update group info.');
    }

    const updatedConversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        groupName: groupName ?? conversation.groupName,
      },
      include: {  
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    return {
      success: true,
      message: 'Group conversation updated successfully.',
      data: updatedConversation,
    };

  }

  // add group member
  async addGroupMember(conversationId: number, newMemberId: number, adminId: number) {

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation || !conversation.isGroup) {
      throw new BadRequestException('Group conversation not found.');
    }

    if (conversation.groupAdminId !== adminId) {
      throw new BadRequestException('Only the group admin can add new members.');
    }

    const isAlreadyParticipant = conversation.participants.some(
      (participant) => participant.userId === newMemberId,
    );

    if (isAlreadyParticipant) {
      throw new ConflictException('User is already a participant in this group.');
    }

    const updatedConversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        participants: {
          create: {
            userId: newMemberId,
            role: 'MEMBER',
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return {
      success: true,
      message: 'Group member added successfully.',
      data: updatedConversation,
    };
  }

  // remove group member
  async removeGroupMember(conversationId: number, memberId: number, adminId: number) {

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });


    if (!conversation || !conversation.isGroup) {
      throw new BadRequestException('Group conversation not found.');
    }

    if (conversation.groupAdminId !== adminId) {
      throw new BadRequestException('Only the group admin can remove members.');
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.userId === memberId,
    );

    if (!isParticipant) {
      throw new ConflictException('User is not a participant in this group.');
    }

    const updatedConversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        participants: {
          delete: {
            conversationId_userId: {
              conversationId: conversationId,
              userId: memberId,
            },  
          },
        },
      },
      include: {
        participants: {
          include: {
            user: { 
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    return {
      success: true,
      message: 'Group member removed successfully.',
      data: updatedConversation,
    };
  }

  // leave group
  async leaveGroup(conversationId: number, memberId: number) {

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation || !conversation.isGroup) {
      throw new BadRequestException('Group conversation not found.');
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.userId === memberId,
    );

    if (!isParticipant) {
      throw new ConflictException('You are not a participant in this group.');
    }

    if (conversation.groupAdminId === memberId) {
      throw new BadRequestException('Group admin cannot leave the group. Please assign a new admin before leaving.');
    }

    const updatedConversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        participants: {
          delete: {
            conversationId_userId: {
              conversationId: conversationId,
              userId: memberId,
            },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    return {
      success: true,
      message: 'You have left the group successfully.',
      data: updatedConversation,
    };
  }


  // get all conversation list
  async getAllConversations() {
    // 1. Fetching all conversations from the database
    const conversations = await this.prisma.conversation.findMany({
      // The 'messages' include has been removed
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // 2. Formatting the data without the last message
    const formattedConversations = conversations.map((conv) => {
      if (conv.isGroup) {
        const admin = conv.participants.find((p) => p.role === 'ADMIN');
        return {
          conversationId: conv.id,
          isGroup: true,
          name: conv.groupName,
          admin: admin ? admin.user.name : 'N/A',
          participants: conv.participants.map((p) => p.user),
          // 'lastMessage' property is now completely removed
        };
      } else {
        return {
          conversationId: conv.id,
          isGroup: false,
          participants: conv.participants.map(p => p.user),
          // 'lastMessage' property is now completely removed
        };
      }
    });

    return {
      success: true,
      count: formattedConversations.length,
      data: formattedConversations,
    };
  }
  





}
