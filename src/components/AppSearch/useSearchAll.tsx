import { GetMany, WithId } from "@/utils/types/Entities";
import { hasKeyOfType } from "@/utils/typeUtils";
import { AxiosResponse } from "axios";
import { axiosClientJson } from "@/libraries/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SearchBoxOptions } from "@/components/Inputs/Searchbox";

type SearchAllData<TData extends WithId<object>> = {
  collection: string;
  key: string;
  promise: Promise<AxiosResponse<GetMany<TData>>>;
  toString: (entity: TData) => React.ReactNode;
  cardRender?: (
    entity: TData
  ) => Record<string, (val: unknown) => React.ReactNode>;
};

type Entity = object;

const isString = (v: unknown): v is string => typeof v === "string";

const printObj = (entity: unknown, ...fields: string[]) => {
  if (entity == null) {
    return "";
  }
  if (typeof entity !== "object") {
    return "";
  }
  const result = fields.map((field) =>
    hasKeyOfType(entity, field, isString) ? entity[field] : ""
  );
  return result.join(" ");
};

const useSearchAll: SearchBoxOptions<
  Omit<SearchAllData<WithId<object>>, "promise"> & {
    value: WithId<Entity>[];
    error?: unknown;
    collection: string;
  }
>["searchHook"] = () => {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({
    name: "####",
    skip: "0",
    limit: "10",
  });
  const {
    data: response = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: async () => {
      const trimmedName = searchParams.name.trim();
      if (trimmedName !== "") {
        const promises: SearchAllData<WithId<object>>[] = [
          {
            key: "Sản phẩm",
            promise: axiosClientJson.get("/products", {
              params: { ...searchParams, productName: trimmedName },
            }),
            toString: (obj) => printObj(obj, "name"),
            collection: "products",
          },
          {
            key: "Danh mục",
            promise: axiosClientJson.get("/categories", {
              params: { ...searchParams, name: trimmedName },
            }),
            toString: (obj) => printObj(obj, "name"),
            collection: "categories",
          },
          {
            key: "Bộ sưu tập",
            promise: axiosClientJson.get("/collections", {
              params: { ...searchParams, name: trimmedName },
            }),
            toString: (obj) => printObj(obj, "name"),
            collection: "collections",
          },
          {
            key: "Nhà cung cấp",
            promise: axiosClientJson.get("/suppliers", {
              params: { ...searchParams, name: trimmedName },
            }),
            toString: (obj) => printObj(obj, "name"),
            collection: "suppliers",
          },
          {
            key: "Khách hàng (tên)",
            promise: axiosClientJson.get("/customers", {
              params: { ...searchParams, firstName: trimmedName },
            }),
            toString: (obj) => printObj(obj, "firstName", "lastName", "email"),
            collection: "customers",
          },
          {
            key: "Khách hàng (tên)",
            promise: axiosClientJson.get("/customers", {
              params: { ...searchParams, lastName: trimmedName },
            }),
            toString: (obj) => printObj(obj, "firstName", "lastName"),
            collection: "customers",
          },
          {
            key: "Khách hàng (email)",
            promise: axiosClientJson.get("/customers", {
              params: { ...searchParams, email: trimmedName },
            }),
            toString: (entity) =>
              printObj(entity, "firstName", "lastName", "email"),
            collection: "customers",
          },
          {
            key: "Nhân viên (tên)",
            promise: axiosClientJson.get("/employees", {
              params: { ...searchParams, firstName: trimmedName },
            }),
            toString: (obj) => printObj(obj, "firstName", "lastName", "email"),
            collection: "employees",
          },
          {
            key: "Nhân viên (tên)",
            promise: axiosClientJson.get("/employees", {
              params: { ...searchParams, lastName: trimmedName },
            }),
            toString: (obj) => printObj(obj, "firstName", "lastName"),
            collection: "employees",
          },
          {
            key: "Nhân viên (email)",
            promise: axiosClientJson.get("/employees", {
              params: { ...searchParams, email: trimmedName },
            }),
            toString: (entity) =>
              printObj(entity, "firstName", "lastName", "email"),
            collection: "employees",
          },
        ];

        const arr = await Promise.allSettled(
          promises.map((elem) => elem.promise)
        ).then((data) => {
          return data.map((item, index) => ({
            key: promises[index].key,
            value: item.status === "fulfilled" ? item.value.data.results : [],
            toString: promises[index].toString,
            error: item.status === "rejected" ? item.reason : undefined,
            collection: promises[index].collection,
          }));
        });

        const merged = [
          ...arr
            .reduce((map, obj) => {
              if (!map.has(obj.key)) {
                map.set(obj.key, obj);
              } else {
                map.get(obj.key).value.push(...obj.value);
              }
              return map;
            }, new Map())
            .values(),
        ];

        return merged;
      } else {
        return [];
      }
    },
    queryKey: ["getGeneral", searchParams],
  });
  const onSearch = async (name: string) => {
    if (name.trim() !== "") {
      setSearchParams((prev) => ({ ...prev, name: name }));
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
    data: response,
    error: error,
    isLoading: isLoading,
    onSearch: onSearch,
    loadMore: loadMore,
    // getData: (res: any) => res?.data.results,
  };
};

export default useSearchAll;
