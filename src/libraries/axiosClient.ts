import { message } from "antd";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/utils/constants/URLS";

const axiosClientJson = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosClientForm = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

function setAuthHeader(config: InternalAxiosRequestConfig) {
  const token = window.localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] =
      "Bearer " + window.localStorage.getItem("token");
  }
  return config;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleUnauthorizedError(error: any) {
  // // console.table(error);
  if (typeof error !== "object" || error === null) {
    return Promise.reject(error);
  }
  if (error?.response) {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }
    // If Status === 401, Unauthorized:
    // // const errorMsg: string | undefined = error?.response?.data?.message;
    const url: string | undefined = error?.config?.url;
    // If the request is refresh token request and it failed, stop
    if (url && url.includes("/refreshToken")) {
      localStorage.clear();
      message.info("Please login !!!", 1.5);
      window.location.href = "/";
      return;
    }
    // If it's not a refresh token request:
    const originalConfig = error.config;
    if (!originalConfig.sent) {
      originalConfig.sent = true;
      try {
        // No access token, user not login yet
        const token = window.localStorage.getItem("token");
        if (!token) {
          window.location.href = "/";
          return Promise.reject(error);
        }
        // Have expired token, logged in
        const refreshToken = window.localStorage.getItem("refreshToken");
        if (!refreshToken) {
          return Promise.reject(error);
        }
        const response = await axiosClientJson.post("/employees/refreshToken", {
          refreshToken: refreshToken,
        });
        const newAccessToken = response.data?.token;
        if (!newAccessToken) {
          return Promise.reject(error);
        }
        window.localStorage.setItem("token", newAccessToken);
        originalConfig.headers = {
          ...originalConfig.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        // message.info("System reload", 1.5);
        return axiosClientJson(originalConfig);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  } else if (error.request) {
    return Promise.reject(error);
  } else {
    return Promise.reject(error);
  }
}

async function saveAuthToken(response: AxiosResponse) {
  const { token, refreshToken } = response.data;
  // LOGIN
  if (token) {
    window.localStorage.setItem("token", token);
  }
  if (refreshToken) {
    window.localStorage.setItem("refreshToken", refreshToken);
  }

  return response;
}

// REQUEST
axiosClientJson.interceptors.request.use(setAuthHeader, (error) => {
  Promise.reject(error);
});

axiosClientJson.interceptors.request.use(
  (config) => {
    if (config.method === "PATCH" && config.url?.includes("/carts/")) {
      const { products: items } = config.data;
      if (items && Array.isArray(items)) {
        items.forEach((item) => {
          item.product.productId = item.product._id;
        });
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// RESPONSE
axiosClientJson.interceptors.response.use(
  saveAuthToken,
  handleUnauthorizedError
);

axiosClientForm.interceptors.request.use(setAuthHeader, (error) => {
  Promise.reject(error);
});

axiosClientForm.interceptors.response.use(
  saveAuthToken,
  handleUnauthorizedError
);

export {
  axiosClientForm,
  axiosClientJson,
  handleUnauthorizedError,
  saveAuthToken,
  setAuthHeader,
};
