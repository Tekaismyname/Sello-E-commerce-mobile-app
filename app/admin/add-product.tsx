import { ProductBasicForm } from "@/components/admin/add-product/product-basic-form";
import { ProductDescription } from "@/components/admin/add-product/product-description";
import { ProductFeatures } from "@/components/admin/add-product/product-features";
import { ProductImagePicker } from "@/components/admin/add-product/product-image-picker";
import { ProductPriceStock } from "@/components/admin/add-product/product-price-stock";
import { ProductSpecs } from "@/components/admin/add-product/product-specs";
import { ProductVariants } from "@/components/admin/add-product/product-variants";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddProductScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#F2F3F7]">
        <Pressable 
          className="h-10 w-10 items-center justify-center -ml-2" 
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#006397" />
        </Pressable>
        <Text className="text-[16px] font-bold text-[#191C1F] ml-2">Thêm sản phẩm mới</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 relative"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="p-4 pb-28">
          <ProductImagePicker />
          <ProductBasicForm />
          <ProductPriceStock />
          <ProductSpecs />
          <ProductFeatures />
          <ProductVariants />
          <ProductDescription />
        </ScrollView>

        {/* Sticky Save Button */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-[#F2F3F7]">
          <Pressable 
            className="w-full h-12 bg-[#006397] rounded-[12px] flex-row items-center justify-center gap-2 shadow-sm"
            onPress={() => router.back()}
          >
            <Feather name="save" size={18} color="white" />
            <Text className="text-[16px] font-bold text-white">Lưu sản phẩm</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
