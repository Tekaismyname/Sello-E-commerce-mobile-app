import { useEffect, useState } from "react";
import { mainService } from "@/services/main.service";
import { CategoriesData, HomeData, ProductListData, SearchData } from "@/types/main";

function useMainDataLoader<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await loader();

        if (active) {
          setData(response);
        }
      } catch {
        if (active) {
          setErrorMessage("Không thể tải dữ liệu.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [loader]);

  return { data, loading, errorMessage };
}

export function useHomeData() {
  return useMainDataLoader<HomeData>(mainService.getHomeData);
}

export function useCategoriesData() {
  return useMainDataLoader<CategoriesData>(mainService.getCategoriesData);
}

export function useSearchData() {
  return useMainDataLoader<SearchData>(mainService.getSearchData);
}

export function useProductListData() {
  return useMainDataLoader<ProductListData>(mainService.getProductListData);
}
