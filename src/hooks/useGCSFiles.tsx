import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { axiosClientJson } from "@/libraries/axiosClient";
import { GCSListResponse } from "@/utils/types/GCS";
import { useState } from "react";

interface UseGCSFilesOptions {
  type?: "image" | "all";
  limit?: number;
}

interface UseGCSFilesReturn {
  files: string[];
  isLoading: boolean;
  error: Error | null;
  nextPageToken: string | null;
  hasMore: boolean;
  limit: number;
  currentPageToken: string | null;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  refetch: () => Promise<any>;
}

/**
 * Custom hook for managing GCS file listing with pagination support.
 * Uses token-based pagination (no offset support in GCS API).
 */
export function useGCSFiles(
  options: UseGCSFilesOptions = {}
): UseGCSFilesReturn {
  const { type = "all", limit = 50 } = options;
  const [currentPageToken, setCurrentPageToken] = useState<string | null>(null);
  const [tokenStack, setTokenStack] = useState<(string | null)[]>([null]); // Stack for back navigation

  const query: UseQueryResult<GCSListResponse> = useQuery({
    queryKey: ["gcs_files", currentPageToken, type, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (type === "image") params.append("type", "image");
      if (currentPageToken) params.append("pageToken", currentPageToken);

      const response = await axiosClientJson.get<GCSListResponse>(
        `/gcs?${params.toString()}`
      );
      return response.data;
    },
    retry: 2,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  const goToNextPage = () => {
    if (query.data?.nextPageToken) {
      setCurrentPageToken(query.data.nextPageToken);
      setTokenStack([...tokenStack, query.data.nextPageToken]);
    }
  };

  const goToPreviousPage = () => {
    if (tokenStack.length > 1) {
      const newStack = tokenStack.slice(0, -1);
      setTokenStack(newStack);
      setCurrentPageToken(newStack[newStack.length - 1]);
    }
  };

  return {
    files: query.data?.files ?? [],
    isLoading: query.isLoading,
    error: query.error,
    nextPageToken: query.data?.nextPageToken ?? null,
    hasMore: query.data?.hasMore ?? false,
    limit: query.data?.limit ?? limit,
    currentPageToken,
    goToNextPage,
    goToPreviousPage,
    refetch: () => query.refetch().then((result) => result.data),
  };
}
