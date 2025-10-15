import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
  
  @UseGuards(JwtAuthGuard)
  @Post('start')
  startConversation(@Body() dto: CreateConversationDto,
         @Req() req
  ) {
    const userId = req.user.id;
    console.log("User ID:", userId);
    return this.conversationService.startConversation(dto.friendId, userId);
  }

  
}
