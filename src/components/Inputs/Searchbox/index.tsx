import { axiosClientJson as client } from "@/libraries/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { Button, Input, List } from "antd";
import { SearchProps } from "antd/es/input";
import { AxiosResponse } from "axios";
import ErrorAndLoading from "components/Placeholders/ErrorAndLoading";
import { useEffect, useRef, useState } from "react";
import {
  GetMany as GetList,
  Product as Product0,
  WithId,
} from "utils/types/Entities";
import style from "./style.module.css";
import { hasKeyOfType } from "@/utils/typeUtils";

type Product = WithId<Product0>;
type Element = JSX.Element;

const SEARCH_DELAY_MS = 500;

type Context = {
  clearTerm?: () => void;
  clickItem?: () => void;
};

export interface SearchBoxOptions<T extends object = { _id: string }> {
  useSearch: () => {
    data: T[];
    error: unknown;
    isLoading: boolean;
    onSearch: (word: string) => void;
    loadMore?: (pageSize?: number) => void;
  };
  renderItem?: (item: T, context: Context) => Element;
  renderList?: (items: T[], context?: Context) => Element;
}

export default function SearchBox<T extends object = { _id: string }>({
  useSearch,
  renderItem,
  renderList,
  searchProps = {},
}: SearchBoxOptions<T> & { searchProps?: SearchProps }) {
  const timeout = useRef<NodeJS.Timeout>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [maskBg, setMaskBg] = useState(false);
  const [isRemovingMask, setIsRemovingMask] = useState(false);
  const removeMaskTimeout = useRef<NodeJS.Timeout>();
  const [isMaskAppear, setIsMaskAppear] = useState(false);

  useEffect(() => {
    if (searchTerm.trim()) {
      setIsShowingResult(true);
    } else {
      setIsShowingResult(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isShowingResult) {
      if (isRemovingMask) {
        clearTimeout(removeMaskTimeout.current);
        setIsRemovingMask(false);
        setMaskBg(true);
      } else {
        setIsMaskAppear(true);
      }
    } else {
      setMaskBg(false);
      setIsRemovingMask(true);
      removeMaskTimeout.current = setTimeout(() => {
        setIsMaskAppear(false);
        setIsRemovingMask(false);
      }, 600);
    }
  }, [isShowingResult, removeMaskTimeout]);

  useEffect(() => {
    if (isMaskAppear) {
      setMaskBg(true);
    }
  }, [isMaskAppear]);

  const { data, error, isLoading, onSearch, loadMore } = useSearch();

  const DataRender = (data: T[]) => {
    const dataArray = data;
    if (renderList) {
      const context = {
        clearTerm: () => setSearchTerm(""),
        clickItem: () => setIsShowingResult(false),
      };
      return renderList(dataArray, context);
    } else if (renderItem) {
      return (
        <List className="rounded shadow max-h-40 overflow-y-auto" size="small">
          {[
            ...dataArray.map((item, index) => {
              const key =
                "_id" in item && typeof item._id === "string"
                  ? item._id
                  : index;
              return (
                <List.Item key={key}>
                  {renderItem(item, { clearTerm: () => setSearchTerm("") })}
                </List.Item>
              );
            }),
            <List.Item key={"load more"}>
              <div className="flex justify-center items-center w-full">
                <Button size="small" type="link" onClick={() => loadMore?.()}>
                  Load more
                </Button>
              </div>
            </List.Item>,
          ]}
        </List>
      );
    } else {
      return null;
    }
  };

  const searchResults = isShowingResult ? (
    <ErrorAndLoading
      error={error}
      isLoading={isLoading || isTyping}
      data={isTyping ? null : data}
      DataRender={DataRender}
    />
  ) : null;

  return (
    <div className="relative">
      <Input.Search
        name="search"
        className="w-full relative z-12"
        onClear={() => setSearchTerm("")}
        allowClear
        onChange={(e) => {
          setIsTyping(true);
          const term = e.target.value;
          setSearchTerm(term);
          if (timeout.current) {
            clearTimeout(timeout.current);
          }
          timeout.current = setTimeout(() => {
            onSearch(term);
            setIsTyping(false);
          }, SEARCH_DELAY_MS);
        }}
        value={searchTerm}
        {...searchProps}
      />
      {isMaskAppear && (
        <div
          className={`${style.mask} ${maskBg ? style.showing : ""}`}
          onClick={() => {
            setIsShowingResult(false);
          }}></div>
      )}
      <div className="w-full absolute z-100 bg-white rounded shadow-xl overflow-hidden">
        {searchResults}
      </div>
    </div>
  );
}

export const useSearchProducts: SearchBoxOptions["useSearch"] = () => {
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
        return client.get<GetList<Product>>("/products", {
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

type SearchAllData<TData = unknown> = {
  key: string;
  promise: Promise<AxiosResponse<GetList<TData>>>;
  toString: (entity: object) => React.ReactNode;
  collection: string;
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

export const useSearchAll: SearchBoxOptions<
  Omit<SearchAllData, "promise"> & {
    value: WithId<Entity>[];
    error?: unknown;
    collection: string;
  }
>["useSearch"] = () => {
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
        const promises: SearchAllData[] = [
          {
            key: "Sản phẩm",
            promise: client.get("/products", {
              params: { ...searchParams, productName: trimmedName },
            }),
            toString: (obj) => printObj(obj, "name"),
            collection: "products",
          },
          {
            key: "Danh mục",
            promise: client.get("/categories", {
              params: { ...searchParams, name: trimmedName },
            }),
            toString: (obj) => printObj(obj, "name"),
            collection: "categories",
          },
          {
            key: "Bộ sưu tập",
            promise: client.get("/collections", {
              params: { ...searchParams, name: trimmedName },
            }),
            toString: (obj) => printObj(obj, "name"),
            collection: "collections",
          },
          {
            key: "Nhà cung cấp",
            promise: client.get("/suppliers", {
              params: { ...searchParams, name: trimmedName },
            }),
            toString: (obj) => printObj(obj, "name"),
            collection: "suppliers",
          },
          {
            key: "Khách hàng (tên)",
            promise: client.get("/customers", {
              params: { ...searchParams, firstName: trimmedName },
            }),
            toString: (obj) => printObj(obj, "firstName", "lastName", "email"),
            collection: "customers",
          },
          {
            key: "Khách hàng (tên)",
            promise: client.get("/customers", {
              params: { ...searchParams, lastName: trimmedName },
            }),
            toString: (obj) => printObj(obj, "firstName", "lastName"),
            collection: "customers",
          },
          {
            key: "Khách hàng (email)",
            promise: client.get("/customers", {
              params: { ...searchParams, email: trimmedName },
            }),
            toString: (entity) =>
              printObj(entity, "firstName", "lastName", "email"),
            collection: "customers",
          },
          {
            key: "Nhân viên (tên)",
            promise: client.get("/employees", {
              params: { ...searchParams, firstName: trimmedName },
            }),
            toString: (obj) => printObj(obj, "firstName", "lastName", "email"),
            collection: "employees",
          },
          {
            key: "Nhân viên (tên)",
            promise: client.get("/employees", {
              params: { ...searchParams, lastName: trimmedName },
            }),
            toString: (obj) => printObj(obj, "firstName", "lastName"),
            collection: "employees",
          },
          {
            key: "Nhân viên (email)",
            promise: client.get("/employees", {
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
