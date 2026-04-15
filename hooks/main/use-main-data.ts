import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { mainService } from "@/services/main.service";
import { CategoriesData, HomeData, ProductListData, SearchData } from "@/types/main";

function useMainDataLoader<T>(loader: () => Promise<T>, refreshOnFocus?: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const skipFirstFocusRefresh = useRef(true);

  const run = useCallback(async (resolver: () => Promise<T>) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await resolver();
      setData(response);
    } catch {
      setErrorMessage("Khong the tai du lieu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await loader();

        if (active) {
          setData(response);
        }
      } catch {
        if (active) {
          setErrorMessage("Khong the tai du lieu.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, [loader]);

  useFocusEffect(
    useCallback(() => {
      if (!refreshOnFocus) {
        return undefined;
      }

      if (skipFirstFocusRefresh.current) {
        skipFirstFocusRefresh.current = false;
        return undefined;
      }

      run(refreshOnFocus).catch(() => undefined);
      return undefined;
    }, [refreshOnFocus, run]),
  );

  return { data, loading, errorMessage };
}

export function useHomeData() {
  return useMainDataLoader<HomeData>(
    () => mainService.getHomeData(),
    () => mainService.getHomeData({ forceRefresh: true }),
  );
}

export function useCategoriesData() {
  return useMainDataLoader<CategoriesData>(
    () => mainService.getCategoriesData(),
    () => mainService.getCategoriesData({ forceRefresh: true }),
  );
}

export function useSearchData() {
  return useMainDataLoader<SearchData>(
    () => mainService.getSearchData(),
    () => mainService.getSearchData({ forceRefresh: true }),
  );
}

export function useProductListData() {
  return useMainDataLoader<ProductListData>(
    () => mainService.getProductListData(),
    () => mainService.getProductListData({ forceRefresh: true }),
  );
}
