import { AdminHeader } from "@/components/admin/shared/admin-header";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MenuGroupKey = "management" | "content";

type MenuItem = {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  route: Href;
  permission: string;
  group: MenuGroupKey;
};

const GROUP_LABELS: Record<MenuGroupKey, string> = {
  management: "Management",
  content: "Support & Content",
};

const GROUP_ORDER: MenuGroupKey[] = ["management", "content"];

const menuItems: MenuItem[] = [
  {
    title: "Orders",
    description: "Track orders, update statuses and process shipments.",
    icon: "truck",
    route: "/admin/orders" as Href,
    permission: "orders:read",
    group: "management",
  },
  {
    title: "Users",
    description: "Manage accounts, user status and admin roles.",
    icon: "users",
    route: "/admin/users" as Href,
    permission: "users:read",
    group: "management",
  },
  {
    title: "Categories",
    description: "Create, edit, toggle visibility of product categories.",
    icon: "layers",
    route: "/admin/categories" as Href,
    permission: "categories:read",
    group: "management",
  },
  {
    title: "Brands",
    description: "Manage product brands, logos, and status.",
    icon: "award",
    route: "/admin/brands" as Href,
    permission: "brands:read",
    group: "management",
  },
  {
    title: "Vouchers",
    description: "Manage vouchers, usage conditions and promotion duration.",
    icon: "tag",
    route: "/admin/vouchers" as Href,
    permission: "vouchers:read",
    group: "management",
  },
  {
    title: "Chat Support",
    description: "Respond to customer messages and queries in real-time.",
    icon: "message-square",
    route: "/admin/chats" as Href,
    permission: "chats:read",
    group: "content",
  },
  {
    title: "Notifications",
    description: "Send notification to all users, customers, or admins.",
    icon: "send",
    route: "/admin/notifications" as Href,
    permission: "notifications:read",
    group: "content",
  },
  {
    title: "Reviews",
    description: "Moderate reviews: show, hide, or delete content.",
    icon: "star",
    route: "/admin/reviews" as Href,
    permission: "reviews:read",
    group: "content",
  },
];

export default function AdminMenuScreen() {
  const { hasPermission } = usePermissions();
  const visibleItems = menuItems.filter((item) => hasPermission(item.permission));

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <AdminHeader title="Menu" />
      <ScrollView contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        <Text className="text-[28px] font-extrabold text-[#191C1F]">Admin Functions</Text>
        <Text className="mt-1 text-[14px] leading-[21px] text-[#607080]">Sub-items are grouped here to keep main navigation concise.</Text>

        {GROUP_ORDER.map((groupKey) => {
          const groupItems = visibleItems.filter((item) => item.group === groupKey);
          if (!groupItems.length) return null;

          return (
            <View key={groupKey} className="mt-5">
              <Text className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#97A0AB]">
                {GROUP_LABELS[groupKey]}
              </Text>
              <View className="gap-3">
                {groupItems.map((item) => (
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
              </View>
            </View>
          );
        })}

        {!visibleItems.length ? (
          <View className="mt-5 items-center rounded-[16px] bg-white p-8">
            <Feather name="lock" size={32} color="#97A0AB" />
            <Text className="mt-3 text-center text-[14px] font-semibold text-[#607080]">This account lacks proper admin privileges.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
