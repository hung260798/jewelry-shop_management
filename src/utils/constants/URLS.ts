export const API_URL = import.meta.env.VITE_API_HOST || "http://localhost:9000";

export const ASSET_URL: string = import.meta.env.VITE_ASSET_URL || API_URL;

// Google Cloud Storage constants
export const GCS_BASE_URL =
  import.meta.env.VITE_GCS_BASE_URL || "https://storage.googleapis.com/";
export const GCS_BUCKET_NAME =
  import.meta.env.VITE_GCS_BUCKET_NAME || "your-bucket-name";
