import { GuestPlaceholder } from "@/components/ui";
import { API_BASE_URL } from "@/constants/api";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import { chatService } from "@/services/chat.service";
import { ChatMessage, ChatRoom } from "@/types/chat";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";

let NativeVideo: any = null;
try {
  const { Video } = require("expo-av");
  NativeVideo = Video;
} catch (e) {
  console.warn("Native Video module not found, fallback enabled.");
}

function CustomerChatScreen() {
  const { token, user } = useAuth();
  const insets = useSafeAreaInsets();
  const { t, showToast } = useSettings();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
    })();
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    chatService
      .getMyRoom(token)
      .then((res) => {
        setRoom(res.data);
        return chatService.getHistory(token, res.data.room_id);
      })
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error("Failed to load chat information:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!room || !token) return;

    const socket = io(API_BASE_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", room.room_id);
      socket.emit("markAsRead", { roomId: room.room_id, readerType: "customer" });
    });

    socket.on("newMessage", (msg: ChatMessage) => {
      if (!msg || !msg.message_id) return;
      setMessages((prev) => {
        // Remove the temporary optimistic message (with negative ID) if it has the same content
        const filtered = prev.filter(
          (item) =>
            !(
              item.message_id < 0 &&
              item.content === msg.content &&
              item.sender_type === msg.sender_type
            )
        );
        if (filtered.some((item) => item.message_id === msg.message_id)) return filtered;
        return [...filtered, msg];
      });

      if (msg.sender_type === "admin") {
        socket.emit("markAsRead", { roomId: room.room_id, readerType: "customer" });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [room, token]);

  const handleSend = () => {
    if (!text.trim() || !room || !user || !socketRef.current) return;

    const messageContent = text.trim();
    setText("");

    // Create optimistic message to display immediately in UI
    const optimisticMessage: ChatMessage = {
      message_id: -Date.now(), // Temporary negative ID
      room_id: room.room_id,
      sender_id: user.id,
      sender_type: "customer",
      content: messageContent,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socketRef.current.emit("sendMessage", {
      roomId: room.room_id,
      senderId: user.id,
      senderType: "customer",
      content: messageContent,
    });
  };

  const uploadMediaFile = async (fileUri: string, isVideo: boolean): Promise<string> => {
    const formData = new FormData();
    let filename = fileUri.split("/").pop() || (isVideo ? "upload.mp4" : "upload.jpg");
    if (!filename.includes(".")) {
      filename = `${filename}.${isVideo ? "mp4" : "jpg"}`;
    }
    const match = /\.(\w+)$/.exec(filename);
    const fileType = isVideo ? "video/mp4" : match ? `image/${match[1]}` : "image/jpeg";

    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: fileType,
    } as any);

    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(t("error_upload_failed", "Không thể tải tệp lên."));
    }

    const json = await res.json();
    const url = json.data.url;
    return url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
  };

  const handlePickMedia = async (type: "image" | "video") => {
    if (!room || !user || !socketRef.current) return;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: type === "image" ? ["images"] : ["videos"],
      allowsEditing: true,
      quality: 0.8,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setMediaUploading(true);

      try {
        const publicUrl = await uploadMediaFile(asset.uri, type === "video");
        const formattedContent = `[${type}]${publicUrl}`;

        socketRef.current.emit("sendMessage", {
          roomId: room.room_id,
          senderId: user.id,
          senderType: "customer",
          content: formattedContent,
        });
      } catch (err: any) {
        showToast(t("error", "Lỗi"), err.message || t("error_upload_failed", "Không thể tải tệp lên."), "error");
      } finally {
        setMediaUploading(false);
      }
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_type === "customer";
    const content = item.content || "";
    const isImage = typeof content === "string" && content.startsWith("[image]");
    const isVideo = typeof content === "string" && content.startsWith("[video]");

    return (
      <View className={`mb-4 flex-row items-end ${isMe ? "justify-end" : "justify-start"}`}>
        {!isMe && (
          <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-[#EAF4FF] border border-[#D0E2FF] shadow-sm shadow-blue-500/10">
            <Feather name="shield" size={13} color="#2d6dff" />
          </View>
        )}
        <View className="max-w-[75%]">
          <View
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isMe
                ? "rounded-tr-none bg-[#2d6dff] shadow-blue-500/15"
                : "rounded-tl-none border border-[#E5E7EB] bg-white shadow-black/5"
            } ${isImage || isVideo ? "overflow-hidden rounded-2xl p-1" : ""}`}
          >
            {isImage ? (
              <Image
                source={{ uri: content.replace("[image]", "") }}
                style={{ width: 220, height: 160, borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : isVideo ? (
              NativeVideo ? (
                <NativeVideo
                  source={{ uri: content.replace("[video]", "") }}
                  style={{ width: 220, height: 160, borderRadius: 12 }}
                  useNativeControls
                  resizeMode="contain"
                  isLooping
                />
              ) : (
                <Pressable
                  onPress={() => {
                    const videoUrl = content.replace("[video]", "");
                    WebBrowser.openBrowserAsync(videoUrl);
                  }}
                  className="flex-row items-center gap-2 rounded-xl bg-black/5 p-3"
                >
                  <Feather name="video" size={18} color="#2d6dff" />
                  <Text className="text-[12px] font-semibold text-[#2d6dff] underline">
                    {t("watch_video", "Xem video trên trình duyệt")}
                  </Text>
                </Pressable>
              )
            ) : (
              <Text className={`text-[14px] leading-5 font-medium ${isMe ? "text-white" : "text-[#1F2937]"}`}>
                {content}
              </Text>
            )}
          </View>
          <Text className={`mt-1 text-[9px] font-semibold text-[#9CA3AF] ${isMe ? "text-right" : "text-left"}`}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  const { language } = useSettings();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F8FC", paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ActivityIndicator size="large" color="#2d6dff" />
        <Text className="mt-3 text-[14px] font-bold text-[#6B7280]">{t("loading", "Đang tải...")}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F8FC", paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Header */}
      <View className="flex-row items-center border-b border-[#E5E7EB] bg-white px-4 py-3 shadow-sm shadow-black/5">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/main/profile");
            }
          }}
          className="mr-3 h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5]"
        >
          <Feather name="arrow-left" size={20} color="#191C1F" />
        </Pressable>
        
        <View className="flex-1">
          <Text className="text-[16px] font-extrabold text-[#111827]">
            {t("live_support", "Hỗ trợ trực tuyến")}
          </Text>
          <View className="mt-0.5 flex-row items-center">
            <View className="mr-1.5 h-2.5 w-2.5 rounded-full bg-[#10B981] border border-[#D1FAE5]" />
            <Text className="text-[11px] font-semibold text-[#6B7280]">
              {t("ready_to_reply", "Sẵn sàng hỗ trợ")}
            </Text>
          </View>
        </View>

        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#EAF4FF]">
          <Feather name="message-square" size={16} color="#2d6dff" />
        </View>
      </View>

      {!token ? (
        <GuestPlaceholder
          icon="message-circle"
          title={t("live_support", "Hỗ trợ trực tuyến")}
          description={t("profile_guest_desc", "Đăng nhập để quản lý địa chỉ giao hàng, danh sách yêu thích và cài đặt tài khoản.")}
        />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.message_id.toString()}
            renderItem={renderMessageItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#EAF4FF] border border-[#D0E2FF] shadow-sm shadow-blue-500/10">
                  <Feather name="message-circle" size={32} color="#2d6dff" />
                </View>
                <Text className="text-[17px] font-extrabold text-[#111827]">
                  {t("chat_welcome_title", "Xin chào!")}
                </Text>
                <Text className="mt-1.5 px-8 text-center text-[13px] font-medium leading-5 text-[#6B7280]">
                  {t("chat_welcome_desc", "Hãy gửi tin nhắn bên dưới để nhận hỗ trợ trực tiếp từ đội ngũ Sello.")}
                </Text>
              </View>
            }
          />

          {mediaUploading && (
            <View className="flex-row items-center justify-center gap-2 border-t border-[#E5E7EB] bg-white py-2.5">
              <ActivityIndicator size="small" color="#2d6dff" />
              <Text className="text-[12px] font-bold text-[#6B7280]">
                {t("uploading_attachment", "Đang tải tệp đính kèm lên...")}
              </Text>
            </View>
          )}

          {/* Input Bar */}
          <View className="border-t border-[#E5E7EB] bg-white px-4 py-3 shadow-lg shadow-black/5">
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => handlePickMedia("image")}
                disabled={mediaUploading}
                style={{
                  height: 36,
                  width: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  backgroundColor: "#F3F4F6",
                }}
              >
                <Feather name="image" size={17} color="#2d6dff" />
              </Pressable>

              <Pressable
                onPress={() => handlePickMedia("video")}
                disabled={mediaUploading}
                style={{
                  marginRight: 4,
                  height: 36,
                  width: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  backgroundColor: "#F3F4F6",
                }}
              >
                <Feather name="video" size={17} color="#2d6dff" />
              </Pressable>

              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={t("chat_placeholder", "Nhập tin nhắn...")}
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
                style={{
                  maxHeight: 100,
                  minHeight: 40,
                  flex: 1,
                  borderRadius: 20,
                  backgroundColor: "#F3F4F6",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  fontSize: 14,
                  color: "#111827",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              />
              <Pressable
                onPress={handleSend}
                disabled={!text.trim() || mediaUploading}
                style={{
                  height: 40,
                  width: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 20,
                  backgroundColor: text.trim() && !mediaUploading ? "#2d6dff" : "#F3F4F6",
                }}
              >
                <Feather
                  name="send"
                  size={16}
                  color={text.trim() && !mediaUploading ? "white" : "#9CA3AF"}
                />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

export default function CustomerChatScreenWrapper() {
  return <CustomerChatScreen />;
}
