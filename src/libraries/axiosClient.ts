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
  if (error.response) {
    if (error?.response?.status !== 401) {
      return Promise.reject(error);
    }
    const errorMsg = error?.response?.data?.message;
    if (
      errorMsg === "refreshToken is not a valid Token" ||
      errorMsg === "refreshToken and id's not match!"
    ) {
      localStorage.clear();
      message.info("Please login !!!", 1.5);
      window.location.href = "/";
      return;
    }
    const originalConfig = error.config;
    if (!originalConfig.sent) {
      originalConfig.sent = true;
      try {
        // Trường hợp không có token thì chuyển sang trang LOGIN
        const token = window.localStorage.getItem("token");
        if (!token) {
          // message.error("Account's not found", 1.5);
          window.location.href = "/";
          return Promise.reject(error);
        }
        const refreshToken = window.localStorage.getItem("refreshToken");
        if (!refreshToken) {
          return Promise.reject(error);
        }
        const response = await axiosClientJson.post("/employees/refreshToken", {
          refreshToken: refreshToken,
        });
        window.localStorage.setItem("token", response.data.token);
        originalConfig.headers = {
          ...originalConfig.headers,
          Authorization: `Bearer ${token}`,
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
