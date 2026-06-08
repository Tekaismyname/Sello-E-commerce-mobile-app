import { useState } from "react";

type RunAuthActionOptions = {
  clearSuccess?: boolean;
};

export function useAuthAction() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const runAuthAction = async <T>(
    action: () => Promise<T>,
    options?: RunAuthActionOptions,
  ): Promise<T | null> => {
    setErrorMessage("");

    if (options?.clearSuccess ?? true) {
      setSuccessMessage("");
    }

    try {
      setLoading(true);
      const result = await action();
      return result;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Yêu cầu thất bại");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    runAuthAction,
  };
}
