import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFriendRequestDto } from './dto/friend-request.dto';
import { UpdateFriendRequestDto } from './dto/update-friend-request.dto';
import { RequestStatus } from '@prisma/client';
import { count } from 'console';


@Injectable()
export class FriendService {
  
    constructor(
     private readonly prisma: PrismaService,
    ) {}

    // Send a friend request
    async sendFriendRequest(friendRequestDto: CreateFriendRequestDto, userId: number) {
        
        const { receiverId } = friendRequestDto;

        if (userId === receiverId) {
            throw new ConflictException('You cannot send a friend request to yourself.');
        }

        const existingRequest = await this.prisma.friendRequest.findFirst({
            where: {
                senderId: userId,
                receiverId,
                status: 'PENDING',
            },
        });

        if (existingRequest) {
            throw new ConflictException('Friend request already sent.');
        }

        
        const alreadyFriends = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId, friendId: receiverId },
                    { userId: receiverId, friendId: userId },
                ],
            },
        });


         if (alreadyFriends)  throw new ConflictException('You are already friends with this user.');



        const friendRequest = await this.prisma.friendRequest.create({
            data: {
                senderId: userId,
                receiverId,
                status: 'PENDING',
            },
        });

        return {
            message: 'Friend request sent successfully.',
            friendRequest,
        }
    }

    // Accept/Reject friend request
    async updateFriendRequest(id: number, userId: number, dto: UpdateFriendRequestDto) {

        const request = await this.prisma.friendRequest.findUnique({ where: { id } });
        if (!request) throw new NotFoundException("Friend request not found");

        if (dto.status === RequestStatus.REJECTED && request.senderId === userId) {
            if (request.status !== RequestStatus.PENDING) {
                throw new BadRequestException("Cannot cancel a request that has been responded to.");
            }
            const deleted = await this.prisma.friendRequest.delete({ where: { id } });
            return {
                message: 'Friend request deleted successfully.',
                deleted,
            };
        }

        if (request.receiverId !== userId) {
            throw new ConflictException("You are not authorized to respond to this friend request.");
        }

        if (request.status === RequestStatus.ACCEPTED || 
            request.status === RequestStatus.REJECTED) {
            throw new BadRequestException('This friend request has already been responded to.');
        }

        if (!Object.values(RequestStatus).includes(dto.status)) {
            throw new BadRequestException('Invalid status value.');
        }

        if (dto.status === RequestStatus.ACCEPTED) {
        
            await this.prisma.friendship.createMany({
                data: [
                    { userId: request.senderId, friendId: request.receiverId },
                    { userId: request.receiverId, friendId: request.senderId },
                ],
                skipDuplicates: true,
            });
            await this.prisma.friendRequest.delete({ where: { id } });

            return { message: 'Friend request accepted and deleted successfully.' };
        }
    }

    // Get all friends of a user
    async getAllFriends(userId: number) {
        const friendships = await this.prisma.friendship.findMany({
            where: { userId },
            include: { friend: true },
        });

        const friends = friendships.map(({ friend }) => friend);
        return { count: friends.length, friends };
    }

    // Get all pending friend requests received by a user
    async getPendingRequests(userId: number) {
        const requests = await this.prisma.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: 'PENDING',
            },
            include: { sender: true },
        });

        return { count: requests.length, requests };
    }

}