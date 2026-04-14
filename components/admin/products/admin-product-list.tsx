import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import { AdminProduct } from "@/types/admin";

export function AdminProductList({ products, totalCount }: { products: AdminProduct[]; totalCount: number }) {
  return (
    <View className="rounded-[16px] bg-white pt-5 pb-2 shadow-sm border border-[#F2F3F7]">
      <View className="flex-row items-center justify-between px-5 mb-4">
        <Text className="text-[18px] font-extrabold text-[#191C1F]">Danh sách mặt hàng</Text>
        <View className="flex-row gap-2">
          <Pressable className="h-8 w-8 items-center justify-center rounded-[6px] bg-[#E8F1FB]">
            <Feather name="list" size={16} color="#006397" />
          </Pressable>
          <Pressable className="h-8 w-8 items-center justify-center rounded-[6px]">
            <Feather name="grid" size={16} color="#97A0AB" />
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-center justify-between px-5 py-3 border-y border-[#F2F3F7] bg-[#F8F9FA]">
        <Text className="text-[11px] font-bold text-[#6b7682] uppercase tracking-wider flex-1">Sản phẩm</Text>
        <Text className="text-[11px] font-bold text-[#6b7682] uppercase tracking-wider w-20 text-center">Danh mục</Text>
        <Text className="text-[11px] font-bold text-[#6b7682] uppercase tracking-wider w-12 text-right">Kho</Text>
      </View>

      <View>
        {products.map((product, index) => (
          <View key={`${product.id}-${index}`} className="flex-row items-center justify-between px-5 py-4 border-b border-[#F2F3F7]">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View className="h-14 w-14 rounded-[8px] bg-[#F4F5F7] overflow-hidden">
                <Image source={{ uri: product.image }} className="h-full w-full" />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold text-[#191C1F] mb-0.5" numberOfLines={2}>{product.name}</Text>
                <Text className="text-[11px] text-[#6b7682]">SKU: {product.id}</Text>
              </View>
            </View>
            <View className="w-16 items-center justify-center">
              <View className="h-10 w-10 rounded-full bg-[#F4F5F7] items-center justify-center px-1">
                <Text className="text-[10px] font-bold text-[#6b7682] text-center leading-[12px]" numberOfLines={2}>{product.category}</Text>
              </View>
            </View>
            <View className="w-12 items-end">
              <Text className="text-[16px] font-extrabold text-[#006397]">{product.stock}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between px-5 py-4">
        <Text className="text-[12px] text-[#6b7682] flex-1">Hiển thị {products.length > 0 ? 1 : 0} - {products.length} trong tổng số {totalCount} sản phẩm</Text>
        <View className="flex-row items-center gap-2">
          <Pressable className="h-7 w-7 items-center justify-center rounded border border-[#E7E8EC]">
            <Feather name="chevron-left" size={14} color="#CCD1D9" />
          </Pressable>
          <Pressable className="h-7 w-7 items-center justify-center rounded bg-[#006397]">
            <Text className="text-[12px] font-bold text-white">1</Text>
          </Pressable>
          <Pressable className="h-7 w-7 items-center justify-center rounded bg-transparent">
            <Text className="text-[12px] font-bold text-[#191C1F]">2</Text>
          </Pressable>
          <Pressable className="h-7 w-7 items-center justify-center rounded bg-transparent">
            <Text className="text-[12px] font-bold text-[#191C1F]">3</Text>
          </Pressable>
          <Pressable className="h-7 w-7 items-center justify-center rounded border border-[#E7E8EC]">
            <Feather name="chevron-right" size={14} color="#191C1F" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
