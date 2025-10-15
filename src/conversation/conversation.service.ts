import { ConflictException, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationService {

  constructor(private readonly prisma: PrismaService) {}

  async startConversation(userId: number, friendId: number) {


      // ১. ইউজার নিজের সাথে conversation শুরু করতে পারবে না
      if(userId === friendId) {
        throw new ConflictException("You cannot start a conversation with yourself");
      }

      // ২. তারা বন্ধু কিনা তা যাচাই করা
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

  
}
