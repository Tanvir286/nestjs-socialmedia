import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Message } from '@prisma/client';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) 
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`✅ Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_conversation')
  async handlejoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `conversation-${conversationId}`;
    await client.join(roomName);
    console.log(`Client ${client.id} joined room: ${roomName}`);
  }

  
 handleNewMessage(newMessage: any) {
    const roomName = `conversation-${newMessage.conversationId}`;
    const payload = {
      id: newMessage.id,
      text: newMessage.text,  
      conversationId: newMessage.conversationId,
      createdAt: newMessage.createdAt,
      sender: {
        id: newMessage.sender.id,
        name: newMessage.sender.name,
      },
    };
    this.server.to(roomName).emit('newMessage', payload);
  }

  handleUpdatedMessage(updatedMessage: any) {
    const roomName = `conversation-${updatedMessage.conversationId}`;
    const payload = {
      id: updatedMessage.id,
      text: updatedMessage.text,
      conversationId: updatedMessage.conversationId,
      createdAt: updatedMessage.createdAt,
      sender: {
        id: updatedMessage.sender.id,
        name: updatedMessage.sender.name,
      },
    };
    this.server.to(roomName).emit('updatedMessage', payload);
  }


  handleDeletedMessage(deletedMessage: any) {
    const roomName = `conversation-${deletedMessage.conversationId}`;
    const payload = {
      id: deletedMessage.id,
      conversationId: deletedMessage.conversationId,
      senderId: deletedMessage.senderId,
    };
    this.server.to(roomName).emit('deletedMessage', payload)
  }


}