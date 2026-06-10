import { axiosClientJson } from "@/libraries/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  GetMany as GetList,
  Product as Product0,
  WithId,
} from "utils/types/Entities";

type Product = WithId<Product0>;
type Element = JSX.Element;

type Context = {
  clearTerm?: () => void;
  clickItem?: () => void;
};

export interface SearchBoxOptions<T extends object = { _id: string }> {
  searchHook: () => {
    data: T[];
    error: unknown;
    isLoading: boolean;
    onSearch: (word: string) => void;
    loadMore?: (pageSize?: number) => void;
  };
  renderItemFn?: (item: T, context: Context) => Element;
  renderListFn?: (items: T[], context?: Context) => Element;
}

export const useSearchProducts: SearchBoxOptions["searchHook"] = () => {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({
    productName: "####",
    skip: "0",
    limit: "10",
  });
  const {
    data: response,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: async () => {
      if (searchParams.productName.trim() !== "") {
        return axiosClientJson.get<GetList<Product>>("/products", {
          params: searchParams,
        });
      } else {
        return undefined;
      }
    },
    queryKey: ["get_products", searchParams],
  });
  const onSearch = async (name: string) => {
    if (name.trim() !== "") {
      setSearchParams((prev) => ({ ...prev, productName: name }));
      await refetch();
    }
  };
  const loadMore = async () => {
    setSearchParams((prev) => ({
      ...prev,
      limit: +prev.limit + 10 + "",
    }));
    await refetch();
  };
  return {
    data: response?.data?.results ?? [],
    error: error,
    isLoading: isLoading,
    onSearch: onSearch,
    loadMore: loadMore,
    // getData: (res: any) => res?.data.results,
  };
};
