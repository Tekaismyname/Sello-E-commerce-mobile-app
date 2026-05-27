import { API_BASE_URL_CANDIDATES, API_ENDPOINTS } from "@/constants/api";
import { ChatMessage, ChatRoom } from "@/types/chat";
import { ApiResponse } from "@/types/customer";

async function requestAuth<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response | null = null;
  const triedBaseUrls: string[] = [];

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    triedBaseUrls.push(baseUrl);

    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init?.headers ?? {}),
        },
      });
      break;
    } catch {
      continue;
    }
  }

  if (!response) {
    throw new Error(
      `Không thể kết nối backend. Đã thử: ${triedBaseUrls.join(", ")}.`,
    );
  }

  const raw = await response.text();
  let payload: Record<string, any> = {};

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : "Yêu cầu thất bại";
    throw new Error(message);
  }

  return payload as T;
}

export const chatService = {
  async getMyRoom(token: string): Promise<ApiResponse<ChatRoom>> {
    const data = await requestAuth<ChatRoom>(API_ENDPOINTS.chat.myRoom, token);
    return {
      message: "Success",
      data,
    };
  },

  async getAdminRooms(token: string): Promise<ApiResponse<ChatRoom[]>> {
    const data = await requestAuth<ChatRoom[]>(API_ENDPOINTS.chat.adminRooms, token);
    return {
      message: "Success",
      data,
    };
  },

  async getHistory(
    token: string,
    roomId: number,
    limit = 50,
    offset = 0,
  ): Promise<ApiResponse<ChatMessage[]>> {
    const data = await requestAuth<ChatMessage[]>(
      `${API_ENDPOINTS.chat.history(roomId)}?limit=${limit}&offset=${offset}`,
      token,
    );
    return {
      message: "Success",
      data,
    };
  },
};
