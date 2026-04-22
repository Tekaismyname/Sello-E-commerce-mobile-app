import { useMemo, useState } from "react";
import { Href, router } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { addressService, profileService } from "@/services/customer.service";

export function useAccountCompletion() {
  const { token, user } = useAuth();
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = useMemo(() => {
    return Boolean(phone.trim() && address.trim());
  }, [address, phone]);

  const submit = async () => {
    if (!token) {
      setErrorMessage("Vui long dang nhap lai.");
      return false;
    }

    if (!canSubmit) {
      setErrorMessage("Vui long nhap so dien thoai va dia chi giao hang.");
      return false;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await profileService.updateProfile(token, {
        fullName: user?.fullName,
        birthDate: birthDate.trim() || undefined,
        gender: gender || undefined,
        emailOptIn,
      });

      const [province, district, ward, ...rest] = address
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const addressesResponse = await addressService.listAddresses(token);
      const existingDefault = addressesResponse.data.find((item) => item.isDefault) ?? addressesResponse.data[0];

      const payload = {
        recipientName: user?.fullName || "Nguoi nhan",
        phone: phone.trim(),
        province: province || "TP. Ho Chi Minh",
        district: district || "Quan 1",
        ward: ward || "Ben Nghe",
        detailAddress: rest.join(", ") || address.trim(),
        isDefault: true,
      };

      if (existingDefault) {
        await addressService.updateAddress(token, existingDefault.id, payload);
        await addressService.setDefaultAddress(token, existingDefault.id, true);
      } else {
        await addressService.createAddress(token, payload);
      }

      router.replace("/main/home" as Href);
      return true;
    } catch (error: any) {
      setErrorMessage(error?.message ?? "Khong the cap nhat thong tin.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const skip = () => {
    router.replace("/main/home" as Href);
  };

  return {
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
    canSubmit,
    submit,
    skip,
  };
}
