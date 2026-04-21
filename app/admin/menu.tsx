import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MenuItem = {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  route: Href;
  permission: string;
};

const menuItems: MenuItem[] = [
  {
    title: "Users",
    description: "Quan ly tai khoan va phan quyen admin.",
    icon: "users",
    route: "/admin/users" as Href,
    permission: "users:read",
  },
  {
    title: "System",
    description: "Cau hinh payment, voucher va danh muc nhanh.",
    icon: "settings",
    route: "/admin/system" as Href,
    permission: "system:dashboard:read",
  },
  {
    title: "Categories",
    description: "Tao, sua va an/hien danh muc san pham.",
    icon: "layers",
    route: "/admin/categories" as Href,
    permission: "categories:read",
  },
  {
    title: "Vouchers",
    description: "Quan ly khuyen mai, dieu kien va han su dung.",
    icon: "tag",
    route: "/admin/vouchers" as Href,
    permission: "vouchers:read",
  },
  {
    title: "Notifications",
    description: "Gui thong bao den user, customer hoac admin.",
    icon: "send",
    route: "/admin/notifications" as Href,
    permission: "notifications:read",
  },
  {
    title: "Reviews",
    description: "Duyet, an/hien va xoa mem danh gia.",
    icon: "star",
    route: "/admin/reviews" as Href,
    permission: "reviews:read",
  },
];

export default function AdminMenuScreen() {
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];
  const can = (permission: string) => permissions.includes(permission);
  const visibleItems = menuItems.filter((item) => can(item.permission));

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <AdminHeader title="Admin Menu" />
      <ScrollView contentContainerClassName="p-4 pb-24">
        <Text className="text-[28px] font-extrabold text-[#191C1F]">Menu quan tri</Text>
        <Text className="mt-1 text-[14px] leading-[21px] text-[#607080]">
          Cac chuc nang duoc hien thi theo quyen admin cua tai khoan hien tai.
        </Text>

        <View className="mt-5 gap-3">
          {visibleItems.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => router.push(item.route)}
              className="flex-row items-center gap-4 rounded-[18px] border border-[#E7EEF5] bg-white p-4 shadow-sm"
            >
              <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-[#EAF4FF]">
                <Feather name={item.icon} size={21} color="#0F6CBD" />
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-extrabold text-[#191C1F]">{item.title}</Text>
                <Text className="mt-1 text-[12px] leading-[18px] text-[#607080]">
                  {item.description}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#97A0AB" />
            </Pressable>
          ))}

          {!visibleItems.length ? (
            <View className="items-center rounded-[18px] bg-white p-8">
              <Feather name="lock" size={32} color="#97A0AB" />
              <Text className="mt-3 text-center text-[14px] font-semibold text-[#607080]">
                Tai khoan nay chua co quyen quan tri phu hop.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
