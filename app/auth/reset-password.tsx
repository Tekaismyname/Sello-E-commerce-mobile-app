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
      setErrorMessage("Missing verification data. Please return to the OTP step.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New password confirmation does not match.");
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
    <AuthScreenShell title="Reset Password" subtitle={`Account: ${identifier}`}>
      <AuthInput
        placeholder="New password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <AuthInput
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
      />

      <AuthMessage kind="error" text={errorMessage} />
      <AuthMessage kind="success" text={successMessage} />

      <AuthButton title="Update Password" loading={loading} onPress={submitResetPassword} />
    </AuthScreenShell>
  );
}
