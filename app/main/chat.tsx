import { GuestPlaceholder } from "@/components/ui";
import { API_BASE_URL } from "@/constants/api";
import { useAuth } from "@/contexts/auth-context";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";

let NativeVideo: any = null;
try {
  const { Video } = require("expo-av");
  NativeVideo = Video;
} catch (e) {
  console.warn("Native Video module not found, fallback enabled.");
}

export default function CustomerChatScreen() {
  const { token, user } = useAuth();
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
      setMessages((prev) => {
        if (prev.some((item) => item.message_id === msg.message_id)) return prev;
        return [...prev, msg];
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

    socketRef.current.emit("sendMessage", {
      roomId: room.room_id,
      senderId: user.id,
      senderType: "customer",
      content: messageContent,
    });
  };

  const uploadMediaFile = async (fileUri: string, isVideo: boolean): Promise<string> => {
    const formData = new FormData();
    const filename = fileUri.split("/").pop() || (isVideo ? "upload.mp4" : "upload.jpg");
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
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to upload the file.");
    }

    const json = await res.json();
    const url = json.data.url;
    return url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
  };

  const handlePickMedia = async (type: "image" | "video") => {
    if (!room || !user || !socketRef.current) return;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: type === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
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
        alert(err.message || "Failed to upload the image/video.");
      } finally {
        setMediaUploading(false);
      }
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_type === "customer";
    const isImage = item.content.startsWith("[image]");
    const isVideo = item.content.startsWith("[video]");

    return (
      <View className={`mb-3 flex-row ${isMe ? "justify-end" : "justify-start"}`}>
        {!isMe && (
          <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-[#EAF4FF]">
            <Feather name="shield" size={13} color="#0F6CBD" />
          </View>
        )}
        <View className="max-w-[75%]">
          <View
            className={`rounded-2xl px-4 py-2.5 ${
              isMe ? "rounded-tr-none bg-[#2d6dff]" : "rounded-tl-none border border-[#E7EEF5] bg-white"
            } ${isImage || isVideo ? "overflow-hidden rounded-2xl p-1" : ""}`}
          >
            {isImage ? (
              <Image
                source={{ uri: item.content.replace("[image]", "") }}
                style={{ width: 220, height: 160, borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : isVideo ? (
              NativeVideo ? (
                <NativeVideo
                  source={{ uri: item.content.replace("[video]", "") }}
                  style={{ width: 220, height: 160, borderRadius: 12 }}
                  useNativeControls
                  resizeMode="contain"
                  isLooping
                />
              ) : (
                <Pressable
                  onPress={() => {
                    const videoUrl = item.content.replace("[video]", "");
                    WebBrowser.openBrowserAsync(videoUrl);
                  }}
                  className="flex-row items-center gap-2 rounded-xl bg-black/5 p-3"
                >
                  <Feather name="video" size={18} color="#2d6dff" />
                  <Text className="text-[12px] font-semibold text-[#2d6dff] underline">
                    Watch video in browser
                  </Text>
                </Pressable>
              )
            ) : (
              <Text className={`text-[14px] leading-5 ${isMe ? "text-white" : "text-[#191C1F]"}`}>
                {item.content}
              </Text>
            )}
          </View>
          <Text className={`mt-1 text-[10px] text-[#97A0AB] ${isMe ? "text-right" : "text-left"}`}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F6F8FC]">
        <ActivityIndicator size="large" color="#2d6dff" />
        <Text className="mt-2 font-medium text-[#607080]">Loading conversation...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <View className="flex-row items-center border-b border-[#E7EEF5] bg-white px-4 py-3">
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
          <Text className="text-[16px] font-extrabold text-[#191C1F]">Live support</Text>
          <View className="mt-0.5 flex-row items-center">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-[#107C41]" />
            <Text className="text-[11px] font-medium text-[#607080]">Ready to reply</Text>
          </View>
        </View>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#EAF4FF]">
          <Feather name="message-square" size={16} color="#2d6dff" />
        </View>
      </View>

      {!token ? (
        <GuestPlaceholder
          icon="message-circle"
          title="Support chat"
          description="Sign in to your Sello account to start chatting live with our customer care team."
        />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
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
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#EAF4FF]">
                  <Feather name="message-circle" size={32} color="#2d6dff" />
                </View>
                <Text className="text-[16px] font-extrabold text-[#191C1F]">Hello!</Text>
                <Text className="mt-1 px-8 text-center text-[13px] leading-5 text-[#607080]">
                  Send a message below to get direct support from the Sello team.
                </Text>
              </View>
            }
          />

          {mediaUploading && (
            <View className="flex-row items-center justify-center gap-2 border-t border-[#E7EEF5] bg-white py-2">
              <ActivityIndicator size="small" color="#2d6dff" />
              <Text className="text-[12px] font-semibold text-[#607080]">Uploading attachment...</Text>
            </View>
          )}

          <View className="border-t border-[#E7EEF5] bg-white px-4 py-3">
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => handlePickMedia("image")}
                disabled={mediaUploading}
                className="h-9 w-9 items-center justify-center rounded-full bg-[#F6F8FC] active:bg-[#EAF4FF]"
              >
                <Feather name="image" size={17} color="#2d6dff" />
              </Pressable>

              <Pressable
                onPress={() => handlePickMedia("video")}
                disabled={mediaUploading}
                className="mr-1 h-9 w-9 items-center justify-center rounded-full bg-[#F6F8FC] active:bg-[#EAF4FF]"
              >
                <Feather name="video" size={17} color="#2d6dff" />
              </Pressable>

              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Type a message..."
                placeholderTextColor="#97A0AB"
                multiline
                maxLength={500}
                className="max-h-[100px] min-h-[40px] flex-1 rounded-[20px] bg-[#F6F8FC] px-4 py-2 text-[14px] text-[#191C1F]"
              />
              <Pressable
                onPress={handleSend}
                disabled={!text.trim() || mediaUploading}
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  text.trim() && !mediaUploading ? "bg-[#2d6dff]" : "bg-[#E7EEF5]"
                }`}
              >
                <Feather name="send" size={16} color={text.trim() && !mediaUploading ? "white" : "#97A0AB"} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
