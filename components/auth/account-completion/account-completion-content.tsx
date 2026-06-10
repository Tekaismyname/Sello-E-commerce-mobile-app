import { AuthButton } from "@/components/auth/auth-button";
import { AuthMessage } from "@/components/auth/auth-message";
import { useAccountCompletion } from "@/hooks/auth/use-account-completion";
import { Feather } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function AccountCompletionContent() {
  const {
    birthDate,
    setBirthDate,
    gender,
    setGender,
    address,
    setAddress,
    phone,
    setPhone,
    emailOptIn,
    setEmailOptIn,
    loading,
    errorMessage,
    submit,
    skip,
  } = useAccountCompletion();

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fd]">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView className="flex-1" contentContainerClassName="px-6 pb-10 pt-8" showsVerticalScrollIndicator={false}>
          <View className="items-center">
            <View className="h-24 w-24 items-center justify-center rounded-[24px] bg-[#F0E8FF]">
              <Feather name="shield" size={30} color="#7C3AED" />
            </View>
            <Text className="mt-8 text-center text-[36px] font-extrabold leading-[42px] text-[#111827]">Complete your profile</Text>
            <Text className="mt-3 text-center text-[16px] leading-[24px] text-[#4B5563]">Add a few more details for faster checkout and better account security.</Text>
          </View>

          <View className="mt-8 rounded-[16px] bg-white p-4">
            <Text className="text-[14px] font-bold text-[#111827]">Phone number</Text>
            <View className="mt-2 h-[52px] flex-row items-center rounded-[12px] bg-[#F3F5FA] px-4">
              <Feather name="phone" size={16} color="#6B7280" />
              <TextInput className="ml-3 flex-1 text-[16px] text-[#111827]" placeholder="09xx xxx xxx" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <Text className="mt-4 text-[14px] font-bold text-[#111827]">Date of birth (ISO or DD/MM/YYYY)</Text>
            <View className="mt-2 h-[52px] flex-row items-center rounded-[12px] bg-[#F3F5FA] px-4">
              <Feather name="calendar" size={16} color="#6B7280" />
              <TextInput className="ml-3 flex-1 text-[16px] text-[#111827]" placeholder="1998-08-20" value={birthDate} onChangeText={setBirthDate} />
            </View>

            <Text className="mt-4 text-[14px] font-bold text-[#111827]">Shipping address</Text>
            <View className="mt-2 min-h-[90px] rounded-[12px] bg-[#F3F5FA] px-4 py-3">
              <TextInput className="text-[16px] text-[#111827]" placeholder="House number, street, ward..." value={address} onChangeText={setAddress} multiline />
            </View>

            <Text className="mt-4 text-[14px] font-bold text-[#111827]">Gender</Text>
            <View className="mt-2 flex-row gap-2">
              {([
                { id: "male", label: "Male" },
                { id: "female", label: "Female" },
                { id: "other", label: "Other" },
              ] as const).map((item) => (
                <Pressable key={item.id} className={`h-11 flex-1 items-center justify-center rounded-[10px] ${gender === item.id ? "bg-[#2F95D2]" : "bg-[#EEF2F7]"}`} onPress={() => setGender(item.id)}>
                  <Text className={`text-[13px] font-bold ${gender === item.id ? "text-white" : "text-[#334155]"}`}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-3 py-3">
              <View className="flex-row items-center gap-2">
                <Feather name="mail" size={16} color="#15803D" />
                <Text className="text-[14px] font-semibold text-[#111827]">Receive offers by email</Text>
              </View>
              <Switch value={emailOptIn} onValueChange={setEmailOptIn} />
            </View>
          </View>

          <AuthMessage kind="error" text={errorMessage} />

          <AuthButton title="Complete" loading={loading} className="mt-4" onPress={submit} />
          <Pressable className="mt-2 h-[48px] items-center justify-center" onPress={skip}>
            <Text className="text-[14px] font-semibold text-[#6B7280]">Skip</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
