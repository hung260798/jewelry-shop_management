import { axiosClientJson } from "@/libraries/axiosClient";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { message } from "antd";
import { produce } from "immer";
import { Dispatch, SetStateAction, useState } from "react";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";
import { GetMany, GetOne } from "utils/types/Entities";

interface UseMyQueryProps {
  url: string;
  queryKey?: (string | number)[];
  initParams?: Record<string, string>;
  usePrivateParams?: boolean;
}

export function urlSearchParamsToRecord(
  params: URLSearchParams
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};

  params.forEach((value, key) => {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value);
      } else {
        result[key] = [result[key] as string, value];
      }
    } else {
      result[key] = value;
    }
  });

  return result;
}

export function urlSearchParamsToArray(
  params: URLSearchParams
): [string, string | string[]][] {
  const result: Record<string, string | string[]> = {};

  params.forEach((value, key) => {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value);
      } else {
        result[key] = [result[key] as string, value];
      }
    } else {
      result[key] = value;
    }
  });

  return Object.entries(result).sort((a, b) => a[0].localeCompare(b[0]));
}

export function compareSearchParamsArray(
  arr1: [string, string | string[]][],
  arr2: [string, string | string[]][]
): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    const [key1, value1] = arr1[i];
    const [key2, value2] = arr2[i];
    if (key1 !== key2) return false;
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) return false;
      for (let j = 0; j < value1.length; j++) {
        if (value1[j] !== value2[j]) return false;
      }
    } else if (value1 !== value2) {
      return false;
    }
  }
  return true;
}

export interface MyQueryReturnType<T> {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  searchItems: (
    queries:
      | { type: string; value?: string }
      | { type: string; value?: string }[]
      | URLSearchParams,
    options?: {
      replace?: boolean;
      resetSkip?: boolean;
    }
  ) => Promise<void>;
  query: UseQueryResult<T, unknown>;
  setPrivateParams?: Dispatch<SetStateAction<URLSearchParams>>;
}

const REFETCH_INTERVAL_MINUTE = 5;

const ONE_MINUTE = 60 * 1000;

const REFETCH_INTERVAL = ONE_MINUTE * REFETCH_INTERVAL_MINUTE;

export const skipAndLimit = {
  skip: "0",
  limit: "10",
};

export const sortById = {
  sortBy: "_id",
  sortOrder: "1",
};

export const defaultQueryObj: Record<string, string> = {
  ...skipAndLimit,
  ...sortById,
};

function addParam(
  params: URLSearchParams,
  param: { type: string; value?: string }
) {
  const { type, value } = param;
  if (!value) {
    params.delete(type);
  } else {
    params.set(type, value);
  }
}

export default function useMyQuery<T extends object>(
  props: UseMyQueryProps
): MyQueryReturnType<T> {
  const {
    url,
    queryKey = [url],
    initParams = {},
    usePrivateParams = false,
  } = props;

  const [searchParams, setSearchParams] = useSearchParams({
    ...defaultQueryObj,
    ...initParams,
  });

  const [privateParams, setPrivateParams] = useState<URLSearchParams>(
    new URLSearchParams({ ...defaultQueryObj, ...initParams })
  );

  const setPrivateParamsWrapper: SetURLSearchParams = (newParams) => {
    if (newParams == null) {
      setPrivateParams(new URLSearchParams());
      return;
    }
    if (typeof newParams === "function") {
      setPrivateParams((prev) => {
        const result = newParams(prev);
        if (result == null) {
          return new URLSearchParams();
          // return prev;
        }
        return new URLSearchParams(result.toString());
      });
    }
    if (newParams instanceof URLSearchParams) {
      setPrivateParams(newParams);
      return;
    }
    if (Array.isArray(newParams)) {
      const params = new URLSearchParams();
      for (const [key, value] of newParams) {
        params.append(key, value);
      }
      setPrivateParams(params);
      return;
    }
    if (typeof newParams === "object") {
      const params = new URLSearchParams();
      for (const key in newParams) {
        const value = newParams[key];
        if (Array.isArray(value)) {
          for (const v of value) {
            params.append(key, v);
          }
        } else if (value !== undefined) {
          params.set(key, value);
        }
      }
      setPrivateParams(params);
      return;
    }
  };

  const usedParams = usePrivateParams ? privateParams : searchParams;
  const setParams = usePrivateParams
    ? setPrivateParamsWrapper
    : setSearchParams;
  const query = useQuery({
    queryKey: [...queryKey, ...urlSearchParamsToArray(usedParams)],
    queryFn: async () => {
      const idNames = ["_id", "id", "searchId"];
      let idValue;
      for (const name of idNames) {
        if (!idValue) {
          idValue = usedParams.get(name);
        } else {
          break;
        }
      }
      const axiosResponse = await axiosClientJson.get<T>(
        idValue ? `${url}/${idValue}` : `${url}?${usedParams.toString()}`
      );
      return axiosResponse.data;
    },
    retry: false,
    refetchInterval: REFETCH_INTERVAL,
  });

  const searchForItems: MyQueryReturnType<T>["searchItems"] = async (
    queries,
    options
  ) => {
    try {
      const { replace = false, resetSkip = false } = options || {};
      const newParams: URLSearchParams = new URLSearchParams(
        replace ? {} : usedParams
      );
      if (queries instanceof URLSearchParams) {
        for (const [type, value] of queries.entries()) {
          addParam(newParams, { type, value });
        }
      } else {
        if (!Array.isArray(queries)) {
          queries = [queries];
        }
        for (const query of queries) {
          addParam(newParams, query);
        }
      }
      if (resetSkip) {
        newParams.set("skip", "0");
      }
      setParams(newParams);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        message.error("An unexpected error occurred.");
        return;
      }
      if (!("response" in error)) {
        message.error(error.message);
        return;
      }
      message.error(
        (error.response as { data?: { message?: string } })?.data?.message
      );
    }
  };

  // const searchForItems: ReturnType<T>["searchItems"] = async (
  //   queries,
  //   { replace, resetSkip } = { replace: false, resetSkip: false }
  // ) => {
  //   try {
  //     const paramClone: URLSearchParams = new URLSearchParams(
  //       replace ? {} : usedParams
  //     );
  //     if (queries instanceof URLSearchParams) {
  //       for (const [type, value] of queries.entries()) {
  //         addParam(paramClone, { type, value });
  //       }
  //     } else {
  //       if (!Array.isArray(queries)) {
  //         queries = [queries];
  //       }
  //       for (const query of queries) {
  //         addParam(paramClone, query);
  //       }
  //     }
  //     if (resetSkip) {
  //       paramClone.set("skip", "0");
  //     }
  //     setParams(paramClone);
  //   } catch (error: unknown) {
  //     if (!(error instanceof Error)) {
  //       message.error("An unexpected error occurred.");
  //       return;
  //     }
  //     if (!("response" in error)) {
  //       message.error(error.message);
  //       return;
  //     }
  //     message.error(
  //       (error.response as { data?: { message?: string } })?.data?.message
  //     );
  //   }
  // };

  return {
    searchParams: usedParams,
    setSearchParams: setParams,
    searchItems: searchForItems,
    query: query,
    setPrivateParams: setPrivateParams,
  };
}

export type GetOneOrMany<T> = GetMany<T> | GetOne<T>;

export function useGetListQuery<T>(props: UseMyQueryProps) {
  const queryReturn = useMyQuery<GetOneOrMany<T>>(props);
  return produce(queryReturn, (queryReturn) => {
    const data = queryReturn.query.data;
    if (!data || !("result" in data)) return;
    queryReturn.query.data = {
      ...data,
      amountResults: 1,
      results: [data.result],
    };
  });
}

export function extractArrayFromGetOneOrMany<T>(
  data: GetOneOrMany<T> | undefined
) {
  if (!data) return { dataSource: [], amountResults: 0 };
  if ("results" in data) {
    return {
      dataSource: data.results,
      amountResults: data.amountResults ?? data.results.length,
    };
  }
  if ("result" in data) {
    return { dataSource: [data.result], amountResults: 1 };
  }
  return { dataSource: [], amountResults: 0 };
}

export function useMyPrefetch() {
  const queryClient = useQueryClient();
  const collections = [
    "categories",
    "products",
    "suppliers",
    "customers",
    "employees",
    "collections",
    "orders",
  ];
  const prefetch = () =>
    Promise.allSettled(
      collections.map((collectionName) => {
        return queryClient.prefetchQuery({
          queryKey: [
            `get_${collectionName}`,
            ...Object.entries(defaultQueryObj),
          ],
          queryFn: () =>
            axiosClientJson
              .get<GetMany<unknown>>(`/${collectionName}`)
              .then((response) => response.data),
          staleTime: 3 * 60 * 1000,
          retry: 2,
        });
      })
    );
  return { prefetch };
}
