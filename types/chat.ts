export interface ChatMessage {
  message_id: number;
  room_id: number;
  sender_id: number;
  sender_type: "customer" | "admin";
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  room_id: number;
  user_id: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  full_name?: string;
  email?: string;
  unread_count?: number;
  last_message?: string;
  last_message_at?: string;
}
