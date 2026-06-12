import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  DeviceEventEmitter,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/contexts/auth-context";
import { chatService } from "@/services/chat.service";
import { ChatMessage, ChatRoom } from "@/types/chat";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/constants/api";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";

// Defensive import for native video player
let NativeVideo: any = null;
try {
  const { Video } = require("expo-av");
  NativeVideo = Video;
} catch (e) {
  console.warn("Native Video module not found, fallback enabled.");
}

export default function AdminChatsScreen() {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    const nextRooms = rooms.map((r) =>
      r.room_id === room.room_id ? { ...r, unread_count: 0 } : r
    );
    const newTotal = nextRooms.reduce((sum, r) => sum + (r.unread_count ?? 0), 0);
    setRooms(nextRooms);
    setTimeout(() => {
      DeviceEventEmitter.emit("pendingChatsCount", newTotal);
    }, 0);
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [text, setText] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);

  // Selection Mode State (for bulk mark as read)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<number>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList | null>(null);

  useEffect(() => {
    // Request permissions
    (async () => {
      if (Platform.OS !== "web") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
    })();
  }, []);

  // Load chat rooms for admin
  const loadRooms = React.useCallback(() => {
    if (!token) return;
    setLoadingRooms(true);
    chatService
      .getAdminRooms(token)
      .then((res) => {
        setRooms(res.data);
      })
      .catch((err) => {
        console.error("Error loading chat rooms list:", err);
      })
      .finally(() => {
        setLoadingRooms(false);
      });
  }, [token]);

  useEffect(() => {
    loadRooms();
  }, [token, loadRooms]);

  // Load history when a room is selected
  useEffect(() => {
    if (!selectedRoom || !token) return;

    setLoadingHistory(true);
    chatService
      .getHistory(token, selectedRoom.room_id)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error("Error loading chat history:", err);
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, [selectedRoom, token]);

  // Socket connection for selected room
  useEffect(() => {
    if (!selectedRoom || !token) return;

    const socket = io(API_BASE_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", selectedRoom.room_id);
      socket.emit("markAsRead", { roomId: selectedRoom.room_id, readerType: "admin" });
    });

    socket.on("newMessage", (msg: ChatMessage) => {
      if (!msg || !msg.message_id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.message_id === msg.message_id)) return prev;
        return [...prev, msg];
      });

      if (msg.sender_type === "customer") {
        socket.emit("markAsRead", { roomId: selectedRoom.room_id, readerType: "admin" });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedRoom, token]);

  const handleSend = () => {
    if (!text.trim() || !selectedRoom || !user || !socketRef.current) return;

    const messageContent = text.trim();
    setText("");

    socketRef.current.emit("sendMessage", {
      roomId: selectedRoom.room_id,
      senderId: user.id,
      senderType: "admin",
      content: messageContent,
    });
  };

  const uploadMediaFile = async (fileUri: string, isVideo: boolean): Promise<string> => {
    const formData = new FormData();
    const filename = fileUri.split("/").pop() || (isVideo ? "upload.mp4" : "upload.jpg");
    const match = /\.(\w+)$/.exec(filename);
    const fileType = isVideo ? "video/mp4" : match ? `image/${match[1]}` : `image/jpeg`;

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
      throw new Error("File upload failed.");
    }

    const json = await res.json();
    const url = json.data.url;
    return url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
  };

  const handlePickMedia = async (type: "image" | "video") => {
    if (!selectedRoom || !user || !socketRef.current) return;

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
          roomId: selectedRoom.room_id,
          senderId: user.id,
          senderType: "admin",
          content: formattedContent,
        });
      } catch (err: any) {
        alert(err.message || "Error uploading image/video.");
      } finally {
        setMediaUploading(false);
      }
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Toggle selection for a room
  const toggleRoomSelection = (roomId: number) => {
    const next = new Set(selectedRoomIds);
    if (next.has(roomId)) {
      next.delete(roomId);
    } else {
      next.add(roomId);
    }
    setSelectedRoomIds(next);
  };

  // Bulk mark as read
  const handleBulkMarkAsRead = () => {
    if (selectedRoomIds.size === 0 || !token) return;

    setLoadingRooms(true);
    const socket = io(API_BASE_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      selectedRoomIds.forEach((roomId) => {
        socket.emit("markAsRead", { roomId, readerType: "admin" });
      });

      // Wait briefly for server execution and clean up
      setTimeout(() => {
        socket.disconnect();
        setIsSelectionMode(false);
        setSelectedRoomIds(new Set());
        loadRooms(); // Reload list
      }, 800);
    });
  };

  const selectAllRooms = () => {
    if (selectedRoomIds.size === rooms.length) {
      setSelectedRoomIds(new Set());
    } else {
      setSelectedRoomIds(new Set(rooms.map((r) => r.room_id)));
    }
  };

  const renderRoomItem = ({ item }: { item: ChatRoom }) => {
    const initials = (item.full_name || "C").charAt(0).toUpperCase();
    const isSelected = selectedRoomIds.has(item.room_id);

    return (
      <Pressable
        onPress={() => {
          if (isSelectionMode) {
            toggleRoomSelection(item.room_id);
          } else {
            handleSelectRoom(item);
          }
        }}
        onLongPress={() => {
          if (!isSelectionMode) {
            setIsSelectionMode(true);
            toggleRoomSelection(item.room_id);
          }
        }}
        className="flex-row items-center border-b border-[#F3F4F6] bg-white p-4 active:bg-[#F9FAFB]"
      >
        {isSelectionMode && (
          <View className="mr-3">
            <Feather
              name={isSelected ? "check-square" : "square"}
              size={20}
              color={isSelected ? "#0F6CBD" : "#9CA3AF"}
            />
          </View>
        )}

        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#EBF5FF] border border-[#CDE5FF]">
          <Text className="text-[20px] font-black text-[#0F6CBD]">{initials}</Text>
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] font-extrabold text-[#111827]" numberOfLines={1}>
              {item.full_name || "Customer"}
            </Text>
            <Text className="text-[11px] font-medium text-[#9CA3AF]">
              {formatTime(item.last_message_at || item.updated_at)}
            </Text>
          </View>
          <Text className="mt-0.5 text-[11px] font-semibold text-[#6B7280]" numberOfLines={1}>
            {item.email}
          </Text>
          <Text className="mt-1 text-[13px] font-medium text-[#374151]" numberOfLines={1}>
            {item.last_message || "No messages"}
          </Text>
        </View>
        {!isSelectionMode && (item.unread_count ?? 0) > 0 && (
          <View className="ml-2 h-5.5 min-w-[22px] items-center justify-center rounded-full bg-[#EF4444] px-1.5 shadow-sm shadow-red-500/20">
            <Text className="text-[10px] font-black text-white">{item.unread_count}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_type === "admin";
    const content = item.content || "";
    const isImage = typeof content === "string" && content.startsWith("[image]");
    const isVideo = typeof content === "string" && content.startsWith("[video]");

    return (
      <View className={`mb-4 flex-row items-end ${isMe ? "justify-end" : "justify-start"}`}>
        {!isMe && (
          <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-[#F3F4F6] border border-[#E5E7EB]">
            <Feather name="user" size={13} color="#4B5563" />
          </View>
        )}
        <View className="max-w-[75%]">
          <View
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isMe
                ? "bg-[#0F6CBD] rounded-tr-none shadow-blue-500/15"
                : "bg-white border border-[#E5E7EB] rounded-tl-none shadow-black/5"
            } ${isImage || isVideo ? "p-1 rounded-2xl overflow-hidden" : ""}`}
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
                  className="p-3 bg-black/5 rounded-xl flex-row items-center gap-2"
                >
                  <Feather name="video" size={18} color="#0F6CBD" />
                  <Text className="text-[12px] text-[#0F6CBD] font-semibold underline">
                    View video in browser
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

  // Check permissions
  const permissions = user?.permissions ?? [];
  const hasPermission = permissions.includes("chats:read");

  if (!hasPermission) {
    return (
      <SafeAreaView className="flex-1 bg-[#F6F8FC] items-center justify-center p-6">
        <Feather name="lock" size={48} color="#EF4444" />
        <Text className="mt-4 text-center text-[16px] font-bold text-[#111827]">
          Access Denied
        </Text>
        <Text className="mt-2 text-center text-[14px] leading-5 text-[#6B7280]">
          Your account does not have permission to access support chat.
        </Text>
      </SafeAreaView>
    );
  }

  // Room List View
  if (!selectedRoom) {
    return (
      <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3 shadow-sm shadow-black/5">
          {isSelectionMode ? (
            <>
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => {
                    setIsSelectionMode(false);
                    setSelectedRoomIds(new Set());
                  }}
                  className="h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5]"
                >
                  <Feather name="x" size={20} color="#111827" />
                </Pressable>
                <Text className="text-[16px] font-extrabold text-[#111827]">
                  Selected {selectedRoomIds.size}
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <Pressable onPress={selectAllRooms} className="px-2.5 py-1.5 bg-[#F3F4F6] rounded-lg">
                  <Text className="text-[12px] font-bold text-[#4B5563]">
                    {selectedRoomIds.size === rooms.length ? "Deselect All" : "Select All"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleBulkMarkAsRead}
                  disabled={selectedRoomIds.size === 0}
                  className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    selectedRoomIds.size > 0 ? "bg-[#EBF5FF]" : "bg-[#F3F4F6]"
                  }`}
                >
                  <Feather
                    name="check-circle"
                    size={14}
                    color={selectedRoomIds.size > 0 ? "#0F6CBD" : "#9CA3AF"}
                  />
                  <Text
                    className={`text-[12px] font-extrabold ${
                      selectedRoomIds.size > 0 ? "text-[#0F6CBD]" : "text-[#9CA3AF]"
                    }`}
                  >
                    Mark as Read
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#EBF5FF]">
                  <Feather name="message-circle" size={18} color="#0F6CBD" />
                </View>
                <Text className="text-[18px] font-black text-[#111827]">Support Inbox</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setIsSelectionMode(true)}
                  className="h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5]"
                >
                  <Feather name="check-square" size={16} color="#0F6CBD" />
                </Pressable>
                <Pressable
                  onPress={loadRooms}
                  className="h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5]"
                >
                  <Feather name="refresh-cw" size={16} color="#0F6CBD" />
                </Pressable>
              </View>
            </>
          )}
        </View>

        {/* Room List */}
        {loadingRooms ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0F6CBD" />
            <Text className="mt-3 text-[#6B7280] font-bold">Loading inbox...</Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.room_id.toString()}
            renderItem={renderRoomItem}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F3F4F6] mb-4 border border-[#E5E7EB]">
                  <Feather name="inbox" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-[16px] font-extrabold text-[#111827]">No conversations</Text>
                <Text className="mt-1.5 text-center text-[13px] font-medium text-[#6B7280] px-8">
                  When customers send support messages, the conversation will appear here.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // Conversation Detail View
  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center border-b border-[#E5E7EB] bg-white px-4 py-3 shadow-sm shadow-black/5">
        <Pressable
          onPress={() => {
            setSelectedRoom(null);
            loadRooms();
          }}
          className="mr-3 h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5]"
        >
          <Feather name="arrow-left" size={20} color="#111827" />
        </Pressable>
        <View className="mr-2.5 h-9 w-9 items-center justify-center rounded-full bg-[#EBF5FF] border border-[#CDE5FF]">
          <Text className="text-[14px] font-black text-[#0F6CBD]">
            {(selectedRoom.full_name || "C").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-extrabold text-[#111827]" numberOfLines={1}>
            {selectedRoom.full_name || "Customer"}
          </Text>
          <Text className="text-[11px] font-semibold text-[#6B7280]" numberOfLines={1}>
            {selectedRoom.email}
          </Text>
        </View>
        
        <View className="h-2.5 w-2.5 rounded-full bg-[#10B981] mr-1.5 border border-[#D1FAE5]" />
        <Text className="text-[11px] font-bold text-[#10B981]">Active</Text>
      </View>

      {/* Messages list */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {loadingHistory ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#0F6CBD" />
            <Text className="mt-3 text-[12px] font-semibold text-[#6B7280]">Loading chat history...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.message_id.toString()}
            renderItem={renderMessageItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {mediaUploading && (
          <View className="flex-row items-center justify-center bg-white py-2.5 border-t border-[#E5E7EB] gap-2">
            <ActivityIndicator size="small" color="#0F6CBD" />
            <Text className="text-[12px] text-[#6B7280] font-bold">Uploading attachment...</Text>
          </View>
        )}

        {/* Input Bar */}
        <View className="border-t border-[#E5E7EB] bg-white px-4 py-3 shadow-lg shadow-black/5">
          <View className="flex-row items-center gap-2">
            {/* Image Attach Button */}
            <Pressable
              onPress={() => handlePickMedia("image")}
              disabled={mediaUploading}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] active:bg-[#EAF4FF]"
            >
              <Feather name="image" size={17} color="#0F6CBD" />
            </Pressable>

            {/* Video Attach Button */}
            <Pressable
              onPress={() => handlePickMedia("video")}
              disabled={mediaUploading}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] active:bg-[#EAF4FF] mr-1"
            >
              <Feather name="video" size={17} color="#0F6CBD" />
            </Pressable>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Reply to customer..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              className="max-h-[100px] min-h-[40px] flex-1 rounded-[20px] bg-[#F3F4F6] px-4 py-2 text-[14px] text-[#111827] border border-[#E5E7EB]"
            />
            <Pressable
              onPress={handleSend}
              disabled={!text.trim() || mediaUploading}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                text.trim() && !mediaUploading
                  ? "bg-[#0F6CBD] shadow-md shadow-blue-500/10"
                  : "bg-[#F3F4F6]"
              }`}
            >
              <Feather name="send" size={16} color={text.trim() && !mediaUploading ? "white" : "#9CA3AF"} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
