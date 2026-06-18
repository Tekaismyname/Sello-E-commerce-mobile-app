import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    // In a real app, you might verify JWT here via client.handshake.auth.token
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  private normalizeMessagePayload(payload: unknown) {
    const raw =
      Array.isArray(payload) && payload.length > 0 ? payload[0] : payload;

    const parsed =
      typeof raw === 'string'
        ? (JSON.parse(raw) as Record<string, unknown>)
        : raw && typeof raw === 'object'
          ? (raw as Record<string, unknown>)
          : null;

    if (!parsed) {
      throw new WsException('Invalid message payload');
    }

    const roomId = Number(parsed.roomId);
    const senderId = Number(parsed.senderId);
    const senderType = parsed.type ?? parsed.senderType;
    const content =
      typeof parsed.content === 'string' ? parsed.content.trim() : '';

    if (!Number.isInteger(roomId) || roomId <= 0) {
      throw new WsException('roomId is required');
    }

    if (!Number.isInteger(senderId) || senderId <= 0) {
      throw new WsException('senderId is required');
    }

    if (senderType !== 'customer' && senderType !== 'admin') {
      throw new WsException('sender type must be customer or admin');
    }

    if (!content) {
      throw new WsException('content is required');
    }

    return {
      roomId,
      senderId,
      senderType: senderType as 'customer' | 'admin',
      content,
    };
  }

  private normalizeReadPayload(payload: unknown) {
    const raw =
      Array.isArray(payload) && payload.length > 0 ? payload[0] : payload;

    const parsed =
      typeof raw === 'string'
        ? (JSON.parse(raw) as Record<string, unknown>)
        : raw && typeof raw === 'object'
          ? (raw as Record<string, unknown>)
          : null;

    if (!parsed) {
      throw new WsException('Invalid read payload');
    }

    const roomId = Number(parsed.roomId);
    const readerType = parsed.readerType;

    if (!Number.isInteger(roomId) || roomId <= 0) {
      throw new WsException('roomId is required');
    }

    if (readerType !== 'customer' && readerType !== 'admin') {
      throw new WsException('readerType must be customer or admin');
    }

    return { roomId, readerType: readerType as 'customer' | 'admin' };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number,
  ) {
    client.join(`room_${roomId}`);
    return { status: 'joined', roomId };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    const normalized = this.normalizeMessagePayload(payload);
    const savedMessage = await this.chatService.saveMessage(
      normalized.roomId,
      normalized.senderId,
      normalized.senderType,
      normalized.content,
    );

    this.server.to(`room_${normalized.roomId}`).emit('newMessage', savedMessage);

    if (normalized.senderType === 'customer') {
      setTimeout(async () => {
        try {
          const aiReply = await this.chatService.generateAiResponse(normalized.content);
          if (aiReply) {
            const adminId = await this.chatService.findFirstAdminId();
            const aiSavedMessage = await this.chatService.saveMessage(
              normalized.roomId,
              adminId,
              'admin',
              `🤖 [Sello AI]: ${aiReply}`,
            );
            this.server.to(`room_${normalized.roomId}`).emit('newMessage', aiSavedMessage);
          }
        } catch (err) {
          console.error('AI Auto-Responder Error:', err);
        }
      }, 1200);
    }

    return savedMessage;
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    const normalized = this.normalizeReadPayload(payload);

    await this.chatService.markAsRead(
      normalized.roomId,
      normalized.readerType,
    );
    this.server.to(`room_${normalized.roomId}`).emit('messagesRead', {
      roomId: normalized.roomId,
      readerType: normalized.readerType,
    });
    return { status: 'read', roomId: normalized.roomId };
  }
}
