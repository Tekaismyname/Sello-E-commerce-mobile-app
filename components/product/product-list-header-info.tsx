import { Text } from "react-native";

type ProductListHeaderInfoProps = {
  trail: string;
  keyword: string;
  totalText: string;
};

export function ProductListHeaderInfo({ trail, keyword, totalText }: ProductListHeaderInfoProps) {
  return (
    <>
      <Text className="mt-1 text-[11px] font-semibold text-[#8b94a0]">{trail}</Text>
      <Text className="mt-2 text-[28px] font-extrabold leading-[33px] text-[#1f2934]">
        Kết quả tìm kiếm cho {keyword}
      </Text>
      <Text className="mt-1 text-[12px] font-medium text-[#8c96a2]">{totalText}</Text>
    </>
  );
}
