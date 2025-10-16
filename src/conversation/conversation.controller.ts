import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Put } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupConversationDto } from './dto/update-group-conversation.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';

@Controller('conversation')
@UseGuards(JwtAuthGuard) 
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
  
  // one-to-one conversation start
  @Post('private-message')
  create(@Body() dto: CreateConversationDto,
         @Req() req:any
  ) {
    const userId = req.user.id;
    console.log("User ID:", userId);
    return this.conversationService.createSingleMessage(dto.friendId, userId);
  }

  // One-to-many conversation start
  @Post('create-group')
  createGroup(
         @Body() dto: CreateGroupDto,
         @Req() req:any
  ) {
    const userId = req.user.id;
    console.log("User ID:", userId);
    return this.conversationService.createGroup(dto, userId);
  }

  // update group info
  @Patch('update-group/:conversationId')
  updateGroup(
         @Param('conversationId') conversationId: string,
         @Body() dto: UpdateGroupConversationDto,
         @Req() req:any
  ) {
    const userId = req.user.id;
    console.log("User ID:", userId);
    return this.conversationService.updateGroup(+conversationId, dto, userId);
  }
  
  // add group member 
  @Patch('add-group-member/:conversationId')
  addGroupMember(
         @Param('conversationId') conversationId: string,
         @Body() dto: AddMemberDto,
         @Req() req:any
  ) {
    const adminId = req.user.id;
    console.log("Admin User ID:", adminId);
    return this.conversationService.addGroupMember(+conversationId, dto.memberId, adminId);
  }

  // remove group member
  @Delete('remove-group-member/:conversationId')
  removeGroupMember(
         @Param('conversationId') conversationId: string,
         @Body() dto: RemoveMemberDto,
         @Req() req:any
  ) {
    const adminId = req.user.id;
    console.log("Admin User ID:", adminId);
    return this.conversationService.removeGroupMember(+conversationId, dto.memberId, adminId);
  }

  // leave group
  @Patch('leave-group/:conversationId')
  leaveGroup(
         @Param('conversationId') conversationId: string,
          @Req() req:any
  ) {
    const userId = req.user.id;
    console.log("User ID:", userId);
    return this.conversationService.leaveGroup(+conversationId, userId);
  }


  // get all  conversation lis
  @Get('all-conversations-list')
  getAllConversations(@Req() req: any) {
    const userId = req.user.id;
    console.log("User ID:", userId);
    return this.conversationService.getAllConversations();
  }



}
