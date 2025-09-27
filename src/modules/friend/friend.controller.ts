import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FriendService } from './friend.service';
import { CreateFriendRequestDto } from './dto/friend-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateFriendRequestDto } from './dto/update-friend-request.dto';


@Controller('friend')
export class FriendController {

  constructor(private readonly friendService: FriendService) {}

  // Send a friend request
  @UseGuards(JwtAuthGuard)
  @Post('request')
  sendRequest(@Req() req, @Body() dto: CreateFriendRequestDto) {
    const userId = req.user.id;
    return this.friendService.sendFriendRequest(dto, userId);
  }

  // Accept/reject a friend request
  @UseGuards(JwtAuthGuard)
  @Patch('updaterequest/:id')
  updateRequest(@Req() req, 
                @Param('id') id: number, 
                @Body() UpdateFriendRequestDto: UpdateFriendRequestDto) {
    const userId = req.user.id;
    return this.friendService.updateFriendRequest(id, userId, UpdateFriendRequestDto);
  }

  // Get all friends of the authenticated user
  @UseGuards(JwtAuthGuard)
  @Get('all')
  getAllFriends(@Req() req) {
    const userId = req.user.id;
    return this.friendService.getAllFriends(userId);
  }
  
  // get pending friend requests (received)
  @UseGuards(JwtAuthGuard)
  @Get('pending')
  getPendingRequests(@Req() req) {
    const userId = req.user.id;
    return this.friendService.getPendingRequests(userId);
  }
}
