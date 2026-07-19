import { ActivityIndicator, Image, Platform, Pressable, Switch, Text, TextInput, View } from "react-native";
import { useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL } from "@/constants/api";

type Props = {
  loading?: boolean;
  onSubmit: (payload: {
    title: string;
    content: string;
    targetScope: "all_users" | "customer_only" | "admin_only";
    notificationType?: "promotion" | "order" | "system";
    imageUrl?: string | null;
  }) => Promise<void>;
};

export function AdminNotificationComposer({ loading, onSubmit }: Props) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetScope, setTargetScope] = useState<"all_users" | "customer_only" | "admin_only">("all_users");
  const [notificationType, setNotificationType] = useState<"promotion" | "order" | "system">("system");
  const [imageUrl, setImageUrl] = useState("");
  const [active, setActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
    })();
  }, []);

  const notificationTypeLabel: Record<"system" | "promotion" | "order", string> = {
    system: "System",
    promotion: "Promotion",
    order: "Order",
  };

  const uploadImageFile = async (fileUri: string): Promise<string> => {
    const formData = new FormData();
    let filename = fileUri.split("/").pop() || "upload.jpg";
    if (!filename.includes(".")) {
      filename = `${filename}.jpg`;
    }
    const match = /\.(\w+)$/.exec(filename);
    const fileType = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: fileType,
    } as any);

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: "POST",
      body: formData,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${errorText || res.statusText}`);
    }

    const json = await res.json();
    return `${API_BASE_URL}${json.url}`;
  };

  const pickImage = async () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.4,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setUploading(true);

      try {
        const publicUrl = await uploadImageFile(asset.uri);
        setImageUrl(publicUrl);
      } catch (err: any) {
        alert(err.message || "Cannot upload image.");
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = () => {
    setImageUrl("");
  };

  return (
    <View className="rounded-[16px] bg-white p-4">
      <Text className="text-[20px] font-black text-[#111827]">Create Notification</Text>
      <Text className="mt-1 text-[12px] text-[#6B7280]">Draft and send push notifications to app users.</Text>

      <Text className="mt-4 text-[13px] font-extrabold text-[#111827]">Title</Text>
      <TextInput
        className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 font-semibold text-[#111827]"
        value={title}
        onChangeText={setTitle}
        placeholder="E.g: Weekend Promo"
      />

      <Text className="mt-4 text-[13px] font-extrabold text-[#111827]">Content</Text>
      <TextInput
        className="mt-2 min-h-[100px] rounded-[12px] bg-[#F3F5FA] px-3 py-3 font-semibold text-[#111827]"
        multiline
        value={content}
        onChangeText={setContent}
        placeholder="Enter notification content..."
      />

      <Text className="mt-4 text-[13px] font-extrabold text-[#111827]">Recipients</Text>
      <View className="mt-2 gap-2">
        {([
          { id: "all_users", label: "All Users" },
          { id: "customer_only", label: "Customers Only" },
          { id: "admin_only", label: "Admin Only" },
        ] as const).map((item) => (
          <Pressable
            key={item.id}
            className={`rounded-[12px] border px-3 py-3 ${
              targetScope === item.id ? "border-[#0F6CBD] bg-[#EBF5FF]" : "border-[#E5E7EB] bg-white"
            }`}
            onPress={() => setTargetScope(item.id)}
          >
            <Text
              className={`text-[13px] font-bold ${
                targetScope === item.id ? "text-[#0F6CBD]" : "text-[#374151]"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="mt-4 text-[13px] font-extrabold text-[#111827]">Notification Type</Text>
      <View className="mt-2 flex-row gap-2">
        {(["system", "promotion", "order"] as const).map((item) => (
          <Pressable
            key={item}
            className={`flex-1 h-10 items-center justify-center rounded-[10px] ${
              notificationType === item ? "bg-[#0F6CBD]" : "bg-[#EEF2F7]"
            }`}
            onPress={() => setNotificationType(item)}
          >
            <Text
              className={`text-[12px] font-black ${
                notificationType === item ? "text-white" : "text-[#334155]"
              }`}
            >
              {notificationTypeLabel[item]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="mt-4 text-[13px] font-extrabold text-[#111827]">Attached Image (optional)</Text>
      {uploading ? (
        <View className="mt-2 h-28 items-center justify-center rounded-[12px] border border-dashed border-[#0F6CBD] bg-[#F4F9FC]">
          <ActivityIndicator color="#0F6CBD" />
        </View>
      ) : !imageUrl ? (
        <Pressable
          onPress={pickImage}
          className="mt-2 h-28 items-center justify-center rounded-[12px] border border-dashed border-[#0F6CBD] bg-[#F4F9FC] active:opacity-80"
        >
          <Feather name="image" size={24} color="#0F6CBD" />
          <Text className="mt-2 text-[12px] font-black text-[#0F6CBD]">Choose from library</Text>
        </Pressable>
      ) : (
        <View className="mt-2 h-28 overflow-hidden rounded-[12px] bg-[#F4F5F7] relative border border-[#E5E7EB]">
          <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
          <Pressable
            onPress={removeImage}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5"
          >
            <Feather name="trash-2" size={14} color="white" />
          </Pressable>
          <Pressable
            onPress={pickImage}
            className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1.5 flex-row items-center gap-1"
          >
            <Feather name="edit-2" size={10} color="white" />
            <Text className="text-[10px] font-bold text-white">Change</Text>
          </Pressable>
        </View>
      )}

      <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-3 py-3 border border-[#E5E7EB]">
        <Text className="text-[13px] font-extrabold text-[#111827]">Send Now</Text>
        <Switch value={active} onValueChange={setActive} />
      </View>

      <Pressable
        disabled={loading || !title.trim() || !content.trim() || !active}
        className="mt-5 h-12 items-center justify-center rounded-[12px] bg-[#0F6CBD] disabled:opacity-60"
        onPress={async () => {
          await onSubmit({
            title: title.trim(),
            content: content.trim(),
            targetScope,
            notificationType,
            imageUrl: imageUrl.trim() || null,
          });
        }}
      >
        <Text className="text-[15px] font-bold text-white">Send Notification Now</Text>
      </Pressable>
    </View>
  );
}
