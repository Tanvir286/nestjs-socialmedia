import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // Send a message in a conversation
  @Post('send')
  sendMessage(@Body() createMessageDto: CreateMessageDto,
              @Req() req:any
  ) {
    const senderId = req.user.id;
    return this.messageService.sendMessage(createMessageDto, senderId);
  }


  // Update a message
  @Patch('updateMessage/:messageId')
  updateMessage(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.messageService.updateMessage(
      +messageId,
      updateMessageDto,
      userId,
    );
  }


  // Delete a message
  @Delete('deleteMessage/:messageId')
  deleteMessage(
    @Param('messageId') messageId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.messageService.deleteMessage(+messageId, userId);
  }
 

  // get all messages in a conversation
  @Get(':conversationId/messages')
  getMessages(@Param('conversationId') conversationId: string,
              @Req() req:any
  ) {
    const userId = req.user.id;
    // Optionally, you can verify if the user is a participant of the conversation here
    // before fetching messages.
    return this.messageService.getMessages(+conversationId, userId);
  }

  

}
