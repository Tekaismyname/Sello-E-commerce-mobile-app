import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
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
    title: "Orders",
    description: "Track orders, update statuses and process shipments.",
    icon: "truck",
    route: "/admin/orders" as Href,
    permission: "orders:read",
  },
  {
    title: "Users",
    description: "Manage accounts, user status and admin roles.",
    icon: "users",
    route: "/admin/users" as Href,
    permission: "users:read",
  },
  {
    title: "Categories",
    description: "Create, edit, toggle visibility of product categories.",
    icon: "layers",
    route: "/admin/categories" as Href,
    permission: "categories:read",
  },
  {
    title: "Brands",
    description: "Manage product brands, logos, and status.",
    icon: "award",
    route: "/admin/brands" as Href,
    permission: "brands:read",
  },
  {
    title: "Vouchers",
    description: "Manage vouchers, usage conditions and promotion duration.",
    icon: "tag",
    route: "/admin/vouchers" as Href,
    permission: "vouchers:read",
  },
  {
    title: "Notifications",
    description: "Send notification to all users, customers, or admins.",
    icon: "send",
    route: "/admin/notifications" as Href,
    permission: "notifications:read",
  },
  {
    title: "Reviews",
    description: "Moderate reviews: show, hide, or delete content.",
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
      <AdminHeader title="Menu" />
      <ScrollView contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        <Text className="text-[28px] font-extrabold text-[#191C1F]">Admin Functions</Text>
        <Text className="mt-1 text-[14px] leading-[21px] text-[#607080]">Sub-items are grouped here to keep main navigation concise.</Text>

        <View className="mt-5 gap-3">
          {visibleItems.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => router.push(item.route)}
              className="flex-row items-center gap-4 rounded-[16px] border border-[#E7EEF5] bg-white p-4"
            >
              <View className="h-12 w-12 items-center justify-center rounded-[14px] bg-[#EAF4FF]">
                <Feather name={item.icon} size={21} color="#0F6CBD" />
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-extrabold text-[#191C1F]">{item.title}</Text>
                <Text className="mt-1 text-[12px] leading-[18px] text-[#607080]">{item.description}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#97A0AB" />
            </Pressable>
          ))}

          {!visibleItems.length ? (
            <View className="items-center rounded-[16px] bg-white p-8">
              <Feather name="lock" size={32} color="#97A0AB" />
              <Text className="mt-3 text-center text-[14px] font-semibold text-[#607080]">This account lacks proper admin privileges.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
