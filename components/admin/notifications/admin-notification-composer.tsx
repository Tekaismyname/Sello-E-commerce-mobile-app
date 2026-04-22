import { Pressable, Switch, Text, TextInput, View } from "react-native";
import { useState } from "react";

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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetScope, setTargetScope] = useState<"all_users" | "customer_only" | "admin_only">("all_users");
  const [notificationType, setNotificationType] = useState<"promotion" | "order" | "system">("system");
  const [imageUrl, setImageUrl] = useState("");
  const [active, setActive] = useState(true);

  return (
    <View className="rounded-[16px] bg-white p-4">
      <Text className="text-[22px] font-extrabold text-[#111827]">Tao moi thong bao</Text>
      <Text className="mt-1 text-[13px] text-[#6B7280]">Soan thao va gui thong bao den nguoi dung tren ung dung.</Text>

      <Text className="mt-4 text-[14px] font-bold text-[#111827]">Tieu de</Text>
      <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={title} onChangeText={setTitle} placeholder="VD: Khuyen mai cuoi tuan" />

      <Text className="mt-4 text-[14px] font-bold text-[#111827]">Noi dung</Text>
      <TextInput className="mt-2 min-h-[110px] rounded-[12px] bg-[#F3F5FA] px-3 py-3" multiline value={content} onChangeText={setContent} placeholder="Nhap noi dung thong bao..." />

      <Text className="mt-4 text-[14px] font-bold text-[#111827]">Doi tuong nhan</Text>
      <View className="mt-2 gap-2">
        {([
          { id: "all_users", label: "Tat ca nguoi dung" },
          { id: "customer_only", label: "Chi khach hang" },
          { id: "admin_only", label: "Chi admin" },
        ] as const).map((item) => (
          <Pressable key={item.id} className={`rounded-[12px] border px-3 py-3 ${targetScope === item.id ? "border-[#2F95D2] bg-[#E8F1FB]" : "border-[#E5E7EB] bg-white"}`} onPress={() => setTargetScope(item.id)}>
            <Text className={`text-[14px] font-semibold ${targetScope === item.id ? "text-[#0369A1]" : "text-[#374151]"}`}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="mt-4 text-[14px] font-bold text-[#111827]">Loai thong bao</Text>
      <View className="mt-2 flex-row gap-2">
        {(["system", "promotion", "order"] as const).map((item) => (
          <Pressable key={item} className={`flex-1 h-10 items-center justify-center rounded-[10px] ${notificationType === item ? "bg-[#2F95D2]" : "bg-[#EEF2F7]"}`} onPress={() => setNotificationType(item)}>
            <Text className={`text-[12px] font-bold ${notificationType === item ? "text-white" : "text-[#334155]"}`}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="mt-4 text-[14px] font-bold text-[#111827]">Anh dinh kem URL (tuy chon)</Text>
      <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

      <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-3 py-3">
        <Text className="text-[14px] font-semibold text-[#111827]">Gui ngay</Text>
        <Switch value={active} onValueChange={setActive} />
      </View>

      <Pressable
        disabled={loading || !title.trim() || !content.trim() || !active}
        className="mt-4 h-12 items-center justify-center rounded-[12px] bg-[#2F95D2] disabled:opacity-60"
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
        <Text className="text-[15px] font-bold text-white">Gui thong bao ngay</Text>
      </Pressable>
    </View>
  );
}
