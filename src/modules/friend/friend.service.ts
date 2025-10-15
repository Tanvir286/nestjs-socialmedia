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


        // 🔍 Step 1: check receiver exists
        const receiver = await this.prisma.user.findUnique({
            where: { id: receiverId },
            select: { id: true, name: true, email: true },
        });

        // ✅ if receiver not found — return friendly message
        if (!receiver) {
            return {
            success: false,
            message: `🚫 User with id ${receiverId} not found.`,
            };
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
            include:{
                sender: { select: { id: true, name: true, email: true } },
                receiver: { select: { id: true, name: true, email: true } },
            }
        });

        return {
            success: true,
            message: 'Friend request sent successfully.',
            data:{
                id: friendRequest.id,
                status: friendRequest.status, 
                senderName: friendRequest.sender.name,
                receiverName: friendRequest.receiver.name,
            }
        }
    }

    // Accept/Reject friend request
    async updateFriendRequest(id: number, userId: number, dto: UpdateFriendRequestDto) {

        const request = await this.prisma.friendRequest.findUnique({ 
            where: { id } ,
            include: {
                sender: { select: { id: true, name: true, email: true } },
                receiver: { select: { id: true, name: true, email: true } },
            }
        });

        if (!request) throw new NotFoundException("Friend request not found");

        
        // Allow sender to cancel the request
        if (dto.status === RequestStatus.REJECTED && request.senderId === userId) {
            if (request.status !== RequestStatus.PENDING) {
            throw new BadRequestException('Cannot cancel a request that has already been responded to.');
            }

            await this.prisma.friendRequest.delete({ where: { id } });

            return {
            success: true,
            message: `🚫 Friend request to ${request.receiver.name} has been cancelled.`,
            data: {
                senderId: request.sender.id,
                senderName: request.sender.name,
                receiverId: request.receiver.id,
                receiverName: request.receiver.name,
                status: 'CANCELLED',
            },
            };
        }

        // Only receiver can accept/reject the request
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

             return {
            success: true,
            message: `🎉 You are now friends with ${request.sender.name}.`,
            data: {
                senderId: request.sender.id,
                senderName: request.sender.name,
                receiverId: request.receiver.id,
                receiverName: request.receiver.name,
                status: 'ACCEPTED',
            },
            };
        }
    }

    // Get all friends of a user
    async getAllFriends(userId: number) {
        
     // Fetch friendships including friend's details
        const friendships = await this.prisma.friendship.findMany({
            where: { userId },
            include: {
            friend: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Extract clean friend list
        const friends = friendships.map((f) => ({
            id: f.friend.id,
            name: f.friend.name,
        }));

        // ✅ Return professional response
        if (!friends.length) {
            return {
            success: false,
            message: '😕 You have no friends yet.',
            count: 0,
            friends: [],
            };
        }

        return {
            success: true,
            message: `👬 You have ${friends.length} friend${friends.length > 1 ? 's' : ''}.`,
            count: friends.length,
            friends,
        };
    }

    
    // Get all pending friend requests received by a user
    async getPendingRequests(userId: number) {

        const requests = await this.prisma.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: 'PENDING',
            },
            include: { 
                sender: { select: { 
                    id: true,
                    name: true 
                }
                 },
            },
        });


        // Clean list of pending requests
        const formattedRequests = requests.map((req) => ({
            requestId: req.id,
            senderId: req.sender.id,
            senderName: req.sender.name,
            status: req.status,
        }));

        // ✅ No pending requests
        if (!formattedRequests.length) {
            return {
            success: false,
            message: '📭 You have no pending friend requests.',
            count: 0,
            requests: [],
            };
        }

        // ✅ Has pending requests
        return {
            success: true,
            message: `📬 You have ${formattedRequests.length} pending friend request${
            formattedRequests.length > 1 ? 's' : ''
            }.`,
            count: formattedRequests.length,
            requests: formattedRequests,
        };
        
    }

}