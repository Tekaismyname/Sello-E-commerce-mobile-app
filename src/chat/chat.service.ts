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

  async findFirstAdminId(): Promise<number> {
    return this.database.findFirstAdminId();
  }

  async generateAiResponse(query: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return this.getLocalFallbackResponse(query);
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Bạn là Sello AI - trợ lý ảo thông minh của cửa hàng Sello E-commerce (bán giày dép, quần áo, mũ kính thời trang...). Hãy phản hồi khách hàng một cách lịch sự, thân thiện và cực kỳ ngắn gọn (tối đa 2-3 câu). Trả lời bằng Tiếng Việt.\n\nKhách hàng hỏi: "${query}"\nTrả lời:`,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data: any = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text.trim();
      }
    } catch (err) {
      console.error('Gemini API request failed, falling back to rules:', err);
    }

    return this.getLocalFallbackResponse(query);
  }

  private getLocalFallbackResponse(query: string): string {
    const lower = query.toLowerCase();
    if (lower.includes('giày') || lower.includes('giay') || lower.includes('sneaker') || lower.includes('shoes')) {
      return 'Sello hiện có các mẫu giày thể thao Nike, Adidas thời thượng với mức giá cực kỳ ưu đãi. Bạn có thể ghé mục danh mục "Giày" để xem chi tiết nhé!';
    }
    if (lower.includes('áo') || lower.includes('ao') || lower.includes('thun') || lower.includes('clothing')) {
      return 'Cửa hàng Sello cung cấp đa dạng các mẫu áo thun, áo khoác Nike, Adidas, Zara chất lượng cao, co giãn 4 chiều cực thoải mái!';
    }
    if (lower.includes('quần') || lower.includes('quan') || lower.includes('pants')) {
      return 'Sello có sẵn các mẫu quần tây Zara lịch lãm, quần thể thao Adidas năng động và quần short thun Local Brand cực chất!';
    }
    if (lower.includes('ship') || lower.includes('vận chuyển') || lower.includes('giao hàng') || lower.includes('phí')) {
      return 'Sello giao hàng toàn quốc nhanh chóng trong 2-4 ngày làm việc. Phí ship sẽ được hiển thị chi tiết khi bạn điền địa chỉ ở trang Thanh toán nhé!';
    }
    if (lower.includes('khuyến mãi') || lower.includes('voucher') || lower.includes('giảm giá') || lower.includes('giam gia')) {
      return 'Bạn có thể nhập các mã voucher hấp dẫn ngay tại phần tóm tắt đơn hàng khi tiến hành Thanh toán để nhận ưu đãi lên tới 40%!';
    }
    if (lower.includes('xin chào') || lower.includes('chào') || lower.includes('hello') || lower.includes('hi')) {
      return 'Sello xin chào! Tôi là trợ lý ảo Sello AI. Bạn cần tư vấn thông tin gì về sản phẩm hay đơn hàng của Sello hôm nay ạ?';
    }
    return 'Cảm ơn bạn đã nhắn tin cho Sello! Tôi là trợ lý ảo Sello AI. Câu hỏi của bạn đã được ghi nhận và nhân viên hỗ trợ khách hàng sẽ liên hệ phản hồi bạn sớm nhất.';
  }
}
