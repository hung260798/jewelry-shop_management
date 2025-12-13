import { axiosClientJson } from "@/libraries/axiosClient";
import { GetMany, GetOne } from "@repo/utils/types";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { message } from "antd";
import { Dispatch, SetStateAction, useState } from "react";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";
import { produce } from "immer";

interface UseMyQueryProps {
  url: string;
  queryKey?: (string | number)[];
  initParams?: Record<string, string>;
  usePrivateParams?: boolean;
  placeholderData?: any;
}

interface ReturnType<T> {
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

const REFETCH_INTERVAL_MINUTE = 1;

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

const defaultQueryObj: Record<string, string> = {
  ...skipAndLimit,
  ...sortById,
};

function addParam(
  params: URLSearchParams,
  param: { type: string; value?: string }
) {
  const { type: name, value } = param;
  if ([undefined, ""].includes(value)) {
    params.delete(name);
  } else {
    params.set(name, value as string);
  }
}

export default function useMyQuery<T extends object>(
  props: UseMyQueryProps
): ReturnType<T> {
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

  const usedParams = usePrivateParams ? privateParams : searchParams;
  const setParamsFn = usePrivateParams ? setPrivateParams : setSearchParams;

  const query = useQuery({
    queryKey: [...queryKey, ...usedParams.entries().toArray()],
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
    // placeholderData: initData,
  });

  const searchForItems: ReturnType<T>["searchItems"] = async (
    queries,
    { replace, resetSkip } = { replace: false, resetSkip: false }
  ) => {
    try {
      const paramClone: URLSearchParams = new URLSearchParams(
        replace ? {} : usedParams
      );
      if (!(queries instanceof URLSearchParams)) {
        if (!Array.isArray(queries)) {
          queries = [queries];
        }
        for (const query of queries) {
          addParam(paramClone, query);
        }
      } else {
        for (const [type, value] of queries.entries()) {
          addParam(paramClone, { type, value });
        }
      }
      if (resetSkip) {
        paramClone.set("skip", "0");
      }
      setParamsFn(paramClone);
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
    setSearchParams: setSearchParams,
    searchItems: searchForItems,
    query: query,
    setPrivateParams: setPrivateParams,
  };
}

export type GetOneOrMany<T> = GetMany<T> | GetOne<T>;

export function useGetList<T>(props: UseMyQueryProps) {
  const queryReturn = useMyQuery<GetOneOrMany<T>>(props);
  const data = queryReturn.query.data;
  if (data) {
    if ("result" in data) {
      return produce(queryReturn, (queryReturn) => {
        queryReturn.query.data = {
          ...data,
          amountResults: 1,
          results: [data.result],
        };
      });
      // return {
      //   ...queryReturn,
      //   query: {
      //     ...queryReturn.query,
      //     data: {
      //       ...data,
      //       amountResults: 1,
      //       results: [data.result],
      //     },
      //   },
      // };
    }
  }
  return queryReturn as ReturnType<GetMany<T>>;
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
