import { Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { useAuthAction } from "@/hooks/auth/use-auth-action";
import { authService } from "@/services/auth.service";
import { OtpPurpose } from "@/types/auth";

export default function OtpScreen() {
  const params = useLocalSearchParams<{
    purpose?: string;
    identifier?: string;
    targetValue?: string;
    previewCode?: string;
  }>();

  const purpose = (params.purpose as OtpPurpose | undefined) ?? "register";
  const identifier = params.identifier?.toString() ?? "";
  const targetValue = params.targetValue?.toString() ?? "";
  const previewCode = params.previewCode?.toString() ?? "";

  const [otpCode, setOtpCode] = useState("");
  const { loading, errorMessage, setErrorMessage, runAuthAction } = useAuthAction();

  const submitOtp = async () => {
    setErrorMessage("");

    if (!/^\d{6}$/.test(otpCode)) {
      setErrorMessage("OTP must contain 6 digits.");
      return;
    }

    if (purpose === "register") {
      const verified = await runAuthAction(() =>
        authService.verifyOtp({
          targetValue,
          purpose: "register",
          otpCode,
        }),
      );

      if (verified) {
        router.replace("/auth/login" as Href);
      }
      return;
    }

    const query = new URLSearchParams({
      identifier,
      targetValue,
      otpCode,
    }).toString();

    router.push((`/auth/reset-password?${query}` as unknown) as Href);
  };

  return (
    <AuthScreenShell
      title="Verify OTP"
      subtitle={`OTP was sent to: ${targetValue || "(missing destination)"}`}
    >
      <AuthInput
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={otpCode}
        onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, ""))}
        inputClassName="h-[56px] text-center text-[24px] tracking-[10px]"
      />

      {previewCode ? <AuthMessage kind="info" text={`Dev OTP preview: ${previewCode}`} /> : null}

      <AuthMessage kind="error" text={errorMessage} />

      <AuthButton
        title={purpose === "register" ? "Verify account" : "Continue to reset password"}
        loading={loading}
        onPress={submitOtp}
      />

      <Pressable onPress={() => router.back()}>
        <Text className="text-center text-[14px] font-semibold text-[#157bb8]">Go back</Text>
      </Pressable>
    </AuthScreenShell>
  );
}
