import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

type ProductBasicFormProps = {
  name: string;
  categoryId: string;
  categories?: Array<{ id: number; name: string; status?: string }>;
  onNameChange: (value: string) => void;
  onCategoryIdChange: (value: string) => void;
};

export function ProductBasicForm({
  name,
  categoryId,
  categories = [],
  onNameChange,
  onCategoryIdChange,
}: ProductBasicFormProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((item) => String(item.id) === categoryId),
    [categories, categoryId],
  );

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const activeCategories = categories.filter((item) => (item.status ?? "active") === "active");

    if (!normalizedQuery) {
      return activeCategories;
    }

    return activeCategories.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        String(item.id).includes(normalizedQuery),
    );
  }, [categories, searchQuery]);

  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <Text className="mb-5 text-[16px] font-bold text-[#191C1F]">2. Thông tin cơ bản</Text>

      <View className="gap-4">
        <View>
          <Text className="mb-2 text-[13px] font-bold text-[#3F4850]">Tên sản phẩm *</Text>
          <TextInput
            className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
            placeholder="Nhập tên sản phẩm..."
            placeholderTextColor="#97A0AB"
            value={name}
            onChangeText={onNameChange}
          />
        </View>

        <View>
          <Text className="mb-2 text-[13px] font-bold text-[#3F4850]">Danh mục sản phẩm *</Text>
          <Pressable
            className="h-12 flex-row items-center justify-between gap-2 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4"
            onPress={() => setPickerVisible(true)}
          >
            <View className="flex-1">
              <Text
                className={`text-[14px] ${selectedCategory ? "text-[#191C1F]" : "text-[#97A0AB]"}`}
                numberOfLines={1}
              >
                {selectedCategory
                  ? `${selectedCategory.name} (#${selectedCategory.id})`
                  : "Chọn danh mục theo tên..."}
              </Text>
            </View>
            <Feather name="chevron-down" size={20} color="#6B7682" />
          </Pressable>
          <Text className="mt-2 text-[12px] leading-[18px] text-[#97A0AB]">
            {selectedCategory
              ? `Đang chọn ID ${selectedCategory.id}`
              : "Tìm theo tên hoặc ID để chọn nhanh danh mục."}
          </Text>
        </View>
      </View>

      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="max-h-[82%] rounded-t-[24px] bg-white px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[18px] font-extrabold text-[#191C1F]">Chọn danh mục</Text>
                <Text className="mt-1 text-[13px] text-[#5b6470]">
                  Tìm theo tên hoặc ID, chỉ hiển thị danh mục đang hoạt động.
                </Text>
              </View>
              <Pressable
                onPress={() => setPickerVisible(false)}
                className="h-10 w-10 items-center justify-center"
              >
                <Feather name="x" size={20} color="#1a232d" />
              </Pressable>
            </View>

            <View className="mb-4 flex-row items-center gap-3 rounded-[14px] bg-[#F4F5F7] px-4 py-3">
              <Feather name="search" size={16} color="#6B7682" />
              <TextInput
                className="flex-1 text-[14px] text-[#191C1F]"
                placeholder="Nhập tên danh mục..."
                placeholderTextColor="#97A0AB"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-3">
                {filteredCategories.map((item) => {
                  const isSelected = String(item.id) === categoryId;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        onCategoryIdChange(String(item.id));
                        setPickerVisible(false);
                        setSearchQuery("");
                      }}
                      className={`rounded-[14px] border px-4 py-4 ${
                        isSelected
                          ? "border-[#006397] bg-[#EAF5FF]"
                          : "border-[#E7E8EC] bg-[#F8F9FB]"
                      }`}
                    >
                      <View className="flex-row items-center justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-[14px] font-bold text-[#191C1F]">{item.name}</Text>
                          <Text className="mt-1 text-[12px] text-[#5b6470]">ID: {item.id}</Text>
                        </View>
                        <Feather
                          name={isSelected ? "check-circle" : "circle"}
                          size={18}
                          color={isSelected ? "#006397" : "#97A0AB"}
                        />
                      </View>
                    </Pressable>
                  );
                })}

                {filteredCategories.length === 0 && (
                  <View className="items-center rounded-[14px] bg-[#F8F9FB] p-6">
                    <Text className="text-[14px] text-[#5b6470]">
                      Không tìm thấy danh mục phù hợp.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
