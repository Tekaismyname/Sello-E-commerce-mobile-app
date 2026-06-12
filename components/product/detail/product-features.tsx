import { Feather } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import { ProductDetail } from "@/types/customer";
import { useSettings } from "@/contexts/settings-context";

type ProductFeaturesProps = {
  product: ProductDetail;
};

export function ProductFeatures({ product }: ProductFeaturesProps) {
  const { language, t } = useSettings();
  const isVi = language === "vi";

  const categoryName = product.categoryName ?? (isVi ? "Sản phẩm" : "Product");
  const catLower = categoryName.toLowerCase();

  // Xác định nội dung đặc điểm nổi bật dựa trên danh mục
  let mainFeatureTitle = isVi ? "Thiết Kế Tinh Tế & Hiện Đại" : "Sophisticated & Modern Design";
  let mainFeatureDesc = isVi 
    ? "Sản phẩm được hoàn thiện tỉ mỉ từng chi tiết, mang lại vẻ ngoài cao cấp và trải nghiệm sử dụng hoàn hảo nhất."
    : "The product is meticulously finished in every detail, providing a premium look and the most perfect user experience.";
  let mainFeatureImage = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"; // cửa hàng
  let bullet1Text = isVi ? "Gia công sắc sảo" : "Meticulous craftsmanship";
  let bullet2Text = isVi ? "Độ bền bỉ tối ưu" : "Optimum durability";
  
  let feat1Icon = "shield" as const;
  let feat1Color = "#006397";
  let feat1Title = isVi ? "Chất Lượng Đạt Chuẩn" : "Certified Quality";
  let feat1Desc = isVi 
    ? "Được kiểm định nghiêm ngặt trước khi xuất xưởng, đảm bảo độ tin cậy tuyệt đối."
    : "Strictly tested before leaving the factory, ensuring absolute reliability.";

  let feat2Icon = "check-circle" as const;
  let feat2Color = "#006D37";
  let feat2Title = isVi ? "Thiết Thực, Tiện Dụng" : "Practical & Convenient";
  let feat2Desc = isVi 
    ? "Tối ưu hóa công năng và mang lại sự thuận tiện nhất trong đời sống hàng ngày."
    : "Optimizes functions and provides the ultimate convenience in daily life.";

  let feat3Icon = "award" as const;
  let feat3Color = "#873DA6";
  let feat3Title = isVi ? "Chính Hãng Uy Tín" : "Genuine & Reputable";
  let feat3Desc = isVi 
    ? "Sản phẩm chính hãng chất lượng cao, cam kết mang đến sự hài lòng tối đa."
    : "High-quality genuine products, committed to bringing maximum satisfaction.";

  if (catLower.includes("giày") || catLower.includes("sneaker") || catLower.includes("shoes")) {
    mainFeatureTitle = isVi ? "Công Nghệ Đệm AeroCloud™" : "AeroCloud™ Cushion Technology";
    mainFeatureDesc = isVi 
      ? "Hệ thống đệm khí đa lớp giúp giảm chấn tối đa, bảo vệ xương khớp trong suốt hành trình dài. Mỗi bước đi là một sự tận hưởng."
      : "Multi-layered air cushioning system reduces impact, protecting joints during long journeys. Every step is a joy.";
    mainFeatureImage = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80";
    bullet1Text = isVi ? "Giảm 40% lực tác động" : "Reduces 40% impact force";
    bullet2Text = isVi ? "Phản hồi năng lượng 95%" : "95% energy feedback";
    
    feat1Icon = "shield" as const;
    feat1Color = "#006397";
    feat1Title = isVi ? "Vật Liệu Bền Vững" : "Sustainable Materials";
    feat1Desc = isVi 
      ? "Sử dụng 65% vật liệu tái chế bảo vệ môi trường."
      : "Utilizes 65% recycled materials to protect the environment.";

    feat2Icon = "wind" as const;
    feat2Color = "#006D37";
    feat2Title = isVi ? "Siêu Thoáng Khí" : "Ultra Breathable";
    feat2Desc = isVi 
      ? "Lớp lưới Engineered Mesh tối ưu hóa luồng khí."
      : "Engineered Mesh layer optimizes airflow.";

    feat3Icon = "feather" as const;
    feat3Color = "#873DA6";
    feat3Title = isVi ? "Trọng Lượng Siêu Nhẹ" : "Ultra Lightweight";
    feat3Desc = isVi 
      ? "Cảm giác nhẹ tênh trên từng bước chân di chuyển."
      : "Feather-light feel with every step you take.";
  } else if (catLower.includes("áo") || catLower.includes("quần") || catLower.includes("thời trang") || catLower.includes("clothing") || catLower.includes("apparel") || catLower.includes("pants") || catLower.includes("fashion")) {
    mainFeatureTitle = isVi ? "Vải Cotton Organic 100%" : "100% Organic Cotton Fabric";
    mainFeatureDesc = isVi 
      ? "Chất liệu vải cao cấp được dệt từ sợi cotton hữu cơ tự nhiên siêu mềm mịn, mang lại cảm giác dễ chịu và an toàn nhất cho làn da."
      : "Premium fabric woven from natural organic cotton fibers, ultra-soft and safe for the skin.";
    mainFeatureImage = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80";
    bullet1Text = isVi ? "Thấm hút mồ hôi vượt trội" : "Outstanding sweat absorption";
    bullet2Text = isVi ? "Bền màu, không xơ vải sau giặt" : "Colorfast, no lint after washing";

    feat1Icon = "heart" as const;
    feat1Color = "#D97706";
    feat1Title = isVi ? "Êm Ái & An Toàn" : "Gentle & Safe";
    feat1Desc = isVi 
      ? "Không gây kích ứng da, an toàn kể cả làn da nhạy cảm."
      : "Non-irritating, safe even for sensitive skin.";

    feat2Icon = "wind" as const;
    feat2Color = "#059669";
    feat2Title = isVi ? "Co Giãn 4 Chiều" : "4-Way Stretch";
    feat2Desc = isVi 
      ? "Cấu trúc dệt tổ ong thông thoáng, hoạt động thoải mái."
      : "Breathable honeycomb weave structure, move with comfort.";

    feat3Icon = "scissors" as const;
    feat3Color = "#3182CE";
    feat3Title = isVi ? "Đường May Tỉ Mỉ" : "Meticulous Stitching";
    feat3Desc = isVi 
      ? "Chỉ may chắc chắn, tinh xảo đảm bảo phom dáng chuẩn đẹp."
      : "Sturdy and fine sewing threads, ensuring a perfect fit.";
  } else if (catLower.includes("điện thoại") || catLower.includes("phone") || catLower.includes("laptop") || catLower.includes("máy tính") || catLower.includes("công nghệ") || catLower.includes("electronic") || catLower.includes("computer")) {
    mainFeatureTitle = isVi ? "Vi Xử Lý Siêu Tốc & Tối Tân" : "Ultra-Fast & Advanced Processor";
    mainFeatureDesc = isVi 
      ? "Sở hữu dòng chip thế hệ mới cho hiệu năng vượt trội, xử lý đa nhiệm mượt mà các tác vụ nặng nhất từ công việc đến giải trí."
      : "Equipped with a new-generation chip for superior performance, smoothly multitasking heavy workloads.";
    mainFeatureImage = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
    bullet1Text = isVi ? "Tiết kiệm 30% điện năng tiêu thụ" : "Saves 30% power consumption";
    bullet2Text = isVi ? "Tăng hiệu suất đồ họa đáng kể" : "Significantly boosts graphic performance";

    feat1Icon = "cpu" as const;
    feat1Color = "#3182CE";
    feat1Title = isVi ? "Cấu Hình Mạnh Mẽ" : "Powerful Configuration";
    feat1Desc = isVi 
      ? "Bộ nhớ trong lớn và tốc độ đọc/ghi cực nhanh tải ứng dụng tức thì."
      : "Large internal storage and ultra-fast read/write speed for instant app loads.";

    feat2Icon = "smartphone" as const;
    feat2Color = "#059669";
    feat2Title = isVi ? "Màn Hình Siêu Sắc Nét" : "Ultra-Sharp Screen";
    feat2Desc = isVi 
      ? "Tần số quét cao kết hợp độ phủ màu rộng hiển thị sống động."
      : "High refresh rate combined with wide color gamut for vivid display.";

    feat3Icon = "battery-charging" as const;
    feat3Color = "#D97706";
    feat3Title = isVi ? "Sạc Nhanh Tiện Lợi" : "Convenient Fast Charging";
    feat3Desc = isVi 
      ? "Hỗ trợ công nghệ sạc thông minh bảo vệ an toàn tuổi thọ pin."
      : "Supports smart charging technology to protect battery lifespan.";
  } else if (catLower.includes("đồng hồ") || catLower.includes("watch")) {
    mainFeatureTitle = isVi ? "Bộ Máy Thạch Anh Chuẩn Xác" : "Precise Quartz Movement";
    mainFeatureDesc = isVi 
      ? "Trang bị bộ chuyển động Quartz bền bỉ, hoạt động với độ sai lệch cực thấp theo thời gian."
      : "Equipped with a durable Quartz movement, operating with extremely low deviation over time.";
    mainFeatureImage = "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80";
    bullet1Text = isVi ? "Độ sai lệch cực kỳ nhỏ" : "Extremely minor deviation";
    bullet2Text = isVi ? "Chống nước tiêu chuẩn 5ATM" : "5ATM standard water resistance";

    feat1Icon = "shield" as const;
    feat1Color = "#3182CE";
    feat1Title = isVi ? "Kính Cường Lực" : "Tempered Glass";
    feat1Desc = isVi 
      ? "Mặt kính chống trầy xước tốt khi va chạm nhẹ hàng ngày."
      : "Scratch-resistant glass surface for daily wear and tear.";

    feat2Icon = "droplet" as const;
    feat2Color = "#059669";
    feat2Title = isVi ? "Chống Nước Tốt" : "Good Water Resistance";
    feat2Desc = isVi 
      ? "An tâm đi mưa, rửa tay thoải mái không lo ảnh hưởng bộ máy."
      : "Wash hands and walk in the rain with peace of mind.";

    feat3Icon = "feather" as const;
    feat3Color = "#D97706";
    feat3Title = isVi ? "Kiểu Dáng Thời Thượng" : "Trendy Design";
    feat3Desc = isVi 
      ? "Phù hợp mọi cổ tay và dễ phối với nhiều trang phục khác nhau."
      : "Suits all wrists and matches well with various outfits.";
  }

  return (
    <View className="bg-white px-4 py-8">
      <View className="mb-6 items-center">
        <Text className="text-[20px] font-extrabold text-[#191C1F]">{t("key_features", "Key Features")}</Text>
        <View className="mt-2 h-1 w-12 rounded-full bg-[#006397]" />
      </View>

      <View className="mb-4 overflow-hidden rounded-[12px] bg-[#F2F3F7]">
        <View className="h-[160px] w-full bg-[#006397]">
          <Image 
            source={{ uri: mainFeatureImage }} 
            className="h-full w-full opacity-60" 
            resizeMode="cover" 
          />
        </View>
        <View className="p-4">
          <Text className="mb-2 text-[18px] font-extrabold text-[#191C1F]">{mainFeatureTitle}</Text>
          <Text className="text-[13px] leading-[20px] text-[#3F4850]">{mainFeatureDesc}</Text>
          <View className="mt-4 gap-2">
            <View className="flex-row items-center gap-2">
              <Feather name="check-circle" size={14} color="#006D37" />
              <Text className="text-[12px] font-bold text-[#006D37]">{bullet1Text}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Feather name="check-circle" size={14} color="#006D37" />
              <Text className="text-[12px] font-bold text-[#006D37]">{bullet2Text}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mb-4 flex-row items-center rounded-[12px] p-4" style={{ backgroundColor: feat1Color }}>
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Feather name={feat1Icon} size={20} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-white">{feat1Title}</Text>
          <Text className="mt-1 text-[12px] text-white/80">{feat1Desc}</Text>
        </View>
      </View>

      <View className="mb-4 flex-row items-center rounded-[12px] bg-[#F2F3F7] p-4">
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white">
          <Feather name={feat2Icon} size={20} color={feat2Color} />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-[#191C1F]">{feat2Title}</Text>
          <Text className="mt-1 text-[12px] text-[#3F4850]">{feat2Desc}</Text>
        </View>
      </View>

      <View className="flex-row items-center rounded-[12px] bg-[#F2F3F7] p-4">
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white">
          <Feather name={feat3Icon} size={20} color={feat3Color} />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-[#191C1F]">{feat3Title}</Text>
          <Text className="mt-1 text-[12px] text-[#3F4850]">{feat3Desc}</Text>
        </View>
      </View>
    </View>
  );
}
