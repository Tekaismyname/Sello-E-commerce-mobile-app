import { Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { useAuthAction } from "@/hooks/auth/use-auth-action";
import { authService } from "@/services/auth.service";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    identifier?: string;
    targetValue?: string;
    otpCode?: string;
  }>();

  const identifier = params.identifier?.toString() ?? "";
  const targetValue = params.targetValue?.toString() ?? "";
  const otpCode = params.otpCode?.toString() ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const {
    loading,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    runAuthAction,
  } = useAuthAction();

  const submitResetPassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!identifier || !targetValue || !otpCode) {
      setErrorMessage("Thieu du lieu xac thuc. Vui long quay lai buoc OTP.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("Mật khẩu mới tối thiểu 8 ký tự.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    const response = await runAuthAction(() =>
      authService.resetPassword({
        identifier,
        targetValue,
        otpCode,
        newPassword,
        confirmNewPassword,
      }),
    );

    if (!response) {
      return;
    }

    setSuccessMessage(response.message);
    setTimeout(() => {
      router.replace("/auth/login" as Href);
    }, 1200);
  };

  return (
    <AuthScreenShell title="Đặt lại mật khẩu" subtitle={`Tài khoản: ${identifier}`}>
      <AuthInput
        placeholder="Mật khẩu mới"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <AuthInput
        placeholder="Xác nhận mật khẩu mới"
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
      />

      <AuthMessage kind="error" text={errorMessage} />
      <AuthMessage kind="success" text={successMessage} />

      <AuthButton title="Cap nhat mat khau" loading={loading} onPress={submitResetPassword} />
    </AuthScreenShell>
  );
}
