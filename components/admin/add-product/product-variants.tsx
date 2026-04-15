import { AdminProductVariant } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

type ProductVariantsProps = {
  variants: AdminProductVariant[];
  onChange: (variants: AdminProductVariant[]) => void;
};

const onlyDigits = (value: string) => value.replace(/[^0-9]/g, "");

export function ProductVariants({ variants, onChange }: ProductVariantsProps) {
  const updateVariant = (
    index: number,
    key: keyof AdminProductVariant,
    value: string | number | undefined,
  ) => {
    onChange(
      variants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [key]: value,
            }
          : variant,
      ),
    );
  };

  const addVariant = () => {
    onChange([
      ...variants,
      {
        color: "",
        size: "",
        skuVariant: "",
        price: 0,
        stockQty: 0,
        status: "active",
      },
    ]);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, variantIndex) => variantIndex !== index));
  };

  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-[16px] font-bold text-[#191C1F]">Phan loai san pham</Text>
        <Pressable onPress={addVariant} className="flex-row items-center gap-1">
          <Feather name="plus" size={14} color="#006397" />
          <Text className="text-[13px] font-bold text-[#006397]">Them variant</Text>
        </Pressable>
      </View>

      <View className="gap-4">
        {variants.map((variant, index) => (
          <View key={`variant-${index}`} className="rounded-[12px] border border-[#E7E8EC] bg-[#F8F9FA] p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[12px] font-bold uppercase text-[#6B7682]">Variant {index + 1}</Text>
              <Pressable onPress={() => removeVariant(index)} className="h-7 w-7 items-center justify-center rounded-full bg-[#FFEAEB]">
                <Feather name="trash-2" size={12} color="#DC2626" />
              </Pressable>
            </View>

            <View className="gap-3">
              <View className="flex-row gap-3">
                <TextInput
                  className="flex-1 rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                  placeholder="Mau sac"
                  placeholderTextColor="#97A0AB"
                  value={variant.color ?? ""}
                  onChangeText={(value) => updateVariant(index, "color", value)}
                />
                <TextInput
                  className="flex-1 rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                  placeholder="Kich thuoc"
                  placeholderTextColor="#97A0AB"
                  value={variant.size ?? ""}
                  onChangeText={(value) => updateVariant(index, "size", value)}
                />
              </View>

              <TextInput
                className="rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                placeholder="SKU variant"
                placeholderTextColor="#97A0AB"
                value={variant.skuVariant ?? ""}
                onChangeText={(value) => updateVariant(index, "skuVariant", value)}
              />

              <TextInput
                className="rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                placeholder="URL anh cho variant"
                placeholderTextColor="#97A0AB"
                value={variant.imageUrl ?? ""}
                onChangeText={(value) => updateVariant(index, "imageUrl", value)}
              />

              <View className="flex-row gap-3">
                <TextInput
                  className="flex-1 rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                  placeholder="Gia"
                  placeholderTextColor="#97A0AB"
                  keyboardType="numeric"
                  value={String(variant.price ?? "")}
                  onChangeText={(value) => updateVariant(index, "price", Number(onlyDigits(value) || "0"))}
                />
                <TextInput
                  className="flex-1 rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                  placeholder="Ton kho"
                  placeholderTextColor="#97A0AB"
                  keyboardType="numeric"
                  value={String(variant.stockQty ?? "")}
                  onChangeText={(value) =>
                    updateVariant(index, "stockQty", Number(onlyDigits(value) || "0"))
                  }
                />
              </View>
            </View>
          </View>
        ))}

        {variants.length === 0 && (
          <View className="rounded-[12px] bg-[#F8F9FA] p-4">
            <Text className="text-[13px] text-[#6B7682]">Chua co phan loai nao. Ban co the tao product don hoac them variant moi.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
