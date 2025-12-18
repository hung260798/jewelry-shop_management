const API_HOST = import.meta.env.VITE_API_HOST;

export const API_URL = API_HOST || "http://localhost:9000";

export const ASSET_URL = import.meta.env.VITE_ASSET_URL || API_URL;
