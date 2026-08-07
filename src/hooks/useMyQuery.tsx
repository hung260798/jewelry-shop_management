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

type ObjectOrArray = Record<string, string> | [string, string][];

interface UseMyQueryProps {
  url: string;
  queryKey?: (string | number)[];
  initParams?: ObjectOrArray;
  usePrivateParams?: boolean;
}

export type GetOneOrMany<T> = GetMany<T> | GetOne<T>;

export function convertURLParamsToObject(
  params: URLSearchParams
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};

  params.forEach((value, key) => {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        const arr = result[key] as string[];
        arr.push(value);
        arr.sort();
      } else {
        result[key] = [result[key] as string, value];
      }
    } else {
      result[key] = value;
    }
  });

  return result;
}

export function convertURLParamsToArray(
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
  const compareValue: (
    a: string | string[],
    b: string | string[]
  ) => boolean = (a, b) => {
    if (typeof a !== typeof b) return false;
    if (typeof a === "string") return a === b;
    return (
      a.length === b.length &&
      a
        .map((elem, idx) => elem === b[idx])
        .reduce((prev, cur) => prev && cur, true)
    );
  };
  return arr1
    .map(([k, v], idx) => k === arr2[idx][0] && compareValue(v, arr2[idx][1]))
    .reduce((p, c) => p && c, true);
  // for (let i = 0; i < arr1.length; i++) {
  //   const [key1, value1] = arr1[i];
  //   const [key2, value2] = arr2[i];
  //   if (key1 !== key2) return false;
  //   if (Array.isArray(value1) && Array.isArray(value2)) {
  //     if (value1.length !== value2.length) return false;
  //     for (let j = 0; j < value1.length; j++) {
  //       if (value1[j] !== value2[j]) return false;
  //     }
  //   } else if (value1 !== value2) {
  //     return false;
  //   }
  // }
  // return true;
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
      /** @deprecated do not use */
      resetSkip?: boolean;
    }
  ) => Promise<void>;
  query: UseQueryResult<T, unknown>;
  setPrivateParams?: Dispatch<SetStateAction<URLSearchParams>>;
  queryKey: unknown[];
}

const ONE_MINUTE = 60 * 1000;

const REFETCH_INTERVAL = ONE_MINUTE * 5;

export const defaultQueryObj: Record<string, string> = {
  skip: "0",
  limit: "10",
  sortBy: "_id",
  sortOrder: "1",
};

/**
 * Merges multiple objects or arrays of key-value pairs into a single array of key-value pairs.
 */
const mergeParams = (...args: ObjectOrArray[]) => {
  const merged: [string, string][] = [];

  for (const arg of args) {
    if (Array.isArray(arg)) {
      for (const [key, value] of arg) {
        merged.push([key, value]);
      }
    } else {
      for (const key in arg) {
        merged.push([key, arg[key]]);
      }
    }
  }

  return merged;
};

function changeParam(
  params: URLSearchParams,
  { type, value }: { type: string; value?: string }
) {
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

  const [searchParams, setSearchParams] = useSearchParams(
    mergeParams(defaultQueryObj, initParams)
  );

  const [privateParams, _setPrivateParams] = useState<URLSearchParams>(
    new URLSearchParams(mergeParams(defaultQueryObj, initParams))
  );

  const setPrivateParams: SetURLSearchParams = (newParams) => {
    if (newParams == null) {
      _setPrivateParams(new URLSearchParams());
      return;
    }
    if (typeof newParams === "function") {
      _setPrivateParams((prev) => {
        const result = newParams(prev);
        if (result == null) {
          return new URLSearchParams();
          // return prev;
        }
        return new URLSearchParams(result.toString());
      });
    }
    if (newParams instanceof URLSearchParams) {
      _setPrivateParams(newParams);
      return;
    }
    if (Array.isArray(newParams)) {
      const params = new URLSearchParams();
      for (const [key, value] of newParams) {
        params.append(key, value);
      }
      _setPrivateParams(params);
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
      _setPrivateParams(params);
      return;
    }
  };

  const usedParams = usePrivateParams ? privateParams : searchParams;
  const setParams = usePrivateParams ? setPrivateParams : setSearchParams;
  const finalQueryKey = [...queryKey, convertURLParamsToObject(usedParams)];
  const query = useQuery({
    queryKey: finalQueryKey,
    queryFn: async () => {
      const idNames = ["_id", "id", "searchId"];
      let idValue = usedParams
        .entries()
        .find(([k]) => idNames.includes(k))?.[1];
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
          changeParam(newParams, { type, value });
        }
      } else {
        if (!Array.isArray(queries)) {
          queries = [queries];
        }
        for (const query of queries) {
          changeParam(newParams, query);
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

  return {
    searchParams: usedParams,
    setSearchParams: setParams,
    searchItems: searchForItems,
    query: query,
    queryKey: finalQueryKey,
    setPrivateParams: _setPrivateParams,
  };
}

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
          queryKey: [`${collectionName}`, ...Object.entries(defaultQueryObj)],
          queryFn: () =>
            axiosClientJson
              .get<GetMany<unknown>>(`/${collectionName}`)
              .then((response) => response.data),
          staleTime: 3 * ONE_MINUTE,
          retry: 2,
        });
      })
    );
  return { prefetch };
}
