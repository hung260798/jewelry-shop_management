/**
 * GCS (Google Cloud Storage) related types
 */

export interface GCSFile {
  name: string;
  size?: number;
  contentType?: string;
  timeCreated?: string;
}

export interface GCSListResponse {
  files: string[];
  nextPageToken: string | null;
  hasMore: boolean;
  limit: number;
}

export interface GCSDeleteRequest {
  files: string[];
}

export interface GCSDeleteResponse {
  status: "OK";
}
