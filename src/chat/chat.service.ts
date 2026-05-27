import { Injectable } from '@nestjs/common';
import { MySqlDatabaseService } from '../auth/services/mysql-database.service';

@Injectable()
export class ChatService {
  constructor(private readonly database: MySqlDatabaseService) {}

  async getRoom(userId: number) {
    return this.database.getOrCreateChatRoom(userId);
  }

  async getAdminRooms() {
    return this.database.getAdminChatRooms();
  }

  async getHistory(roomId: number, limit?: number, offset?: number) {
    return this.database.getChatHistory(roomId, limit, offset);
  }

  async saveMessage(roomId: number, senderId: number, senderType: 'customer' | 'admin', content: string) {
    return this.database.saveChatMessage(roomId, senderId, senderType, content);
  }

  async markAsRead(roomId: number, readerType: 'customer' | 'admin') {
    return this.database.markChatMessagesAsRead(roomId, readerType);
  }
}
