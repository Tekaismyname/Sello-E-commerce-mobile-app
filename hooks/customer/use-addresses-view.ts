import { useCallback, useEffect, useState } from "react";
import { addressService } from "@/services/customer.service";
import { Address, CreateAddressPayload, UpdateAddressPayload } from "@/types/customer";

export function useAddressesView(token: string) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!token) {
      setError("Vui long dang nhap de quan ly dia chi.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await addressService.listAddresses(token);
      setAddresses(response.data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Khong the tai dia chi.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const createAddress = useCallback(
    async (payload: CreateAddressPayload) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await addressService.createAddress(token, payload);
        await fetchAddresses();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchAddresses, token],
  );

  const updateAddress = useCallback(
    async (addressId: number, payload: UpdateAddressPayload) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await addressService.updateAddress(token, addressId, payload);
        await fetchAddresses();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchAddresses, token],
  );

  const setDefaultAddress = useCallback(
    async (addressId: number) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await addressService.setDefaultAddress(token, addressId, true);
        await fetchAddresses();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchAddresses, token],
  );

  const deleteAddress = useCallback(
    async (addressId: number) => {
      if (!token) return;
      setSaving(true);
      try {
        await addressService.deleteAddress(token, addressId);
        await fetchAddresses();
      } finally {
        setSaving(false);
      }
    },
    [fetchAddresses, token],
  );

  return {
    addresses,
    loading,
    saving,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
  };
}
