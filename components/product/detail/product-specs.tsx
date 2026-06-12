import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { ProductDetail } from "@/types/customer";
import { useSettings } from "@/contexts/settings-context";

type ProductSpecsProps = {
  product: ProductDetail;
};

export function ProductSpecs({ product }: ProductSpecsProps) {
  const { language, t } = useSettings();
  const isVi = language === "vi";

  const brandName = product.brand?.name ?? "Sello";
  const sku = product.sku ?? `SELLO-${product.id}`;
  const categoryName = product.categoryName ?? (isVi ? "Sản phẩm" : "Product");
  const warranty = product.warrantyMonths 
    ? (isVi ? `${product.warrantyMonths} tháng chính hãng` : `${product.warrantyMonths} months genuine`)
    : (isVi ? "Bảo hành 12 tháng" : "12-month warranty");

  // Tự động suy luận kiểu dáng và chất liệu dựa trên danh mục
  let styleLabel = isVi ? "Kiểu dáng" : "Style";
  let styleValue = isVi ? "Hiện đại / Hợp xu hướng" : "Modern / Trendy";
  let materialLabel = isVi ? "Chất liệu" : "Material";
  let materialValue = isVi ? "Chất liệu cao cấp" : "Premium material";

  const catLower = categoryName.toLowerCase();
  if (catLower.includes("giày") || catLower.includes("sneaker") || catLower.includes("shoes")) {
    styleLabel = isVi ? "Kiểu dáng" : "Style";
    styleValue = isVi ? "Cổ thấp / Thể thao" : "Low top / Sporty";
    materialLabel = isVi ? "Chất liệu" : "Material";
    materialValue = isVi ? "Da nhân tạo / Vải dệt thoáng khí" : "Synthetic leather / Breathable mesh";
  } else if (catLower.includes("áo") || catLower.includes("quần") || catLower.includes("thời trang") || catLower.includes("clothing") || catLower.includes("apparel") || catLower.includes("pants") || catLower.includes("fashion")) {
    styleLabel = isVi ? "Phong cách" : "Style";
    styleValue = isVi ? "Casual / Năng động" : "Casual / Active";
    materialLabel = isVi ? "Chất liệu" : "Material";
    materialValue = isVi ? "Cotton cao cấp co giãn" : "Premium stretch cotton";
  } else if (catLower.includes("điện thoại") || catLower.includes("phone") || catLower.includes("laptop") || catLower.includes("máy tính") || catLower.includes("công nghệ") || catLower.includes("electronic") || catLower.includes("computer")) {
    styleLabel = isVi ? "Hệ điều hành" : "Operating System";
    styleValue = (catLower.includes("điện thoại") || catLower.includes("phone")) ? "Android / iOS" : "Windows / macOS";
    materialLabel = isVi ? "Màn hình" : "Display";
    materialValue = (catLower.includes("điện thoại") || catLower.includes("phone")) ? (isVi ? "OLED / AMOLED sắc nét" : "Sharp OLED / AMOLED") : "IPS LCD Full HD";
  } else if (catLower.includes("đồng hồ") || catLower.includes("watch")) {
    styleLabel = isVi ? "Loại máy" : "Movement";
    styleValue = isVi ? "Quartz (Pin) / Điện tử" : "Quartz (Battery) / Digital";
    materialLabel = isVi ? "Chất liệu dây" : "Strap Material";
    materialValue = isVi ? "Dây cao su / Thép không gỉ" : "Rubber / Stainless steel";
  } else if (catLower.includes("phụ kiện") || catLower.includes("accessories")) {
    styleLabel = isVi ? "Loại sản phẩm" : "Product Type";
    styleValue = isVi ? "Phụ kiện thời trang" : "Fashion accessory";
    materialLabel = isVi ? "Chất liệu" : "Material";
    materialValue = isVi ? "Hợp kim / Nhựa cao cấp" : "Alloy / Premium plastic";
  }

  return (
    <View className="bg-white px-4 py-5">
      <View className="rounded-[12px] bg-[#F2F3F7] p-5">
        <View className="mb-4 flex-row items-center gap-2">
          <Feather name="file-text" size={20} color="#006397" />
          <Text className="text-[18px] font-extrabold text-[#191C1F]">{t("technical_specs", "Technical Specifications")}</Text>
        </View>

        <View className="gap-4">
          <View className="flex-row justify-between border-b border-[#E7E8EC] pb-4">
            <Text className="text-[14px] text-[#3F4850]">{t("brand_filter", "Brand")}</Text>
            <Text className="text-[14px] font-bold text-[#191C1F]">{brandName}</Text>
          </View>
          <View className="flex-row justify-between border-b border-[#E7E8EC] pb-4">
            <Text className="text-[14px] text-[#3F4850]">{t("sku", "SKU")}</Text>
            <Text className="text-[14px] font-bold text-[#191C1F]">{sku}</Text>
          </View>
          <View className="flex-row justify-between border-b border-[#E7E8EC] pb-4">
            <Text className="text-[14px] text-[#3F4850]">{styleLabel}</Text>
            <Text className="text-[14px] font-bold text-[#191C1F]">{styleValue}</Text>
          </View>
          <View className="flex-row justify-between border-b border-[#E7E8EC] pb-4">
            <Text className="text-[14px] text-[#3F4850]">{materialLabel}</Text>
            <Text className="text-[14px] font-bold text-[#191C1F]">{materialValue}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[14px] text-[#3F4850]">{t("warranty", "Warranty")}</Text>
            <Text className="text-[14px] font-bold text-[#191C1F]">{warranty}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
