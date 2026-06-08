import { Controller, Get, Param, ParseIntPipe, Query, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Request } from 'express';
import { JwtPayload } from '../auth/types/auth.types';

type AuthenticatedRequest = Request & { user?: JwtPayload };

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('my-room')
  @UseGuards(RolesGuard)
  @Roles('customer')
  async getMyRoom(@Req() request: AuthenticatedRequest) {
    return this.chatService.getRoom(request.user!.sub);
  }

  @Get('admin-rooms')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('chats:read')
  async getAdminRooms() {
    return this.chatService.getAdminRooms();
  }

  @Get('history/:roomId')
  async getHistory(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const l = limit ? parseInt(limit, 10) : 50;
    const o = offset ? parseInt(offset, 10) : 0;
    return this.chatService.getHistory(roomId, l, o);
  }
}
