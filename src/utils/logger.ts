import { AxiosError } from "axios";

export const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export function getErrorMessage(error: unknown) {
  let errorMsg = "";
  if (import.meta.env.DEV) {
    if (error instanceof AxiosError) {
      errorMsg = error.message.slice(0, 200);
      const responseData = error.response?.data;
      if (responseData) {
        errorMsg += JSON.stringify(responseData).slice(0, 200);
      }
    } else if (error instanceof Error) {
      errorMsg = error.message.slice(0, 200);
    } else {
      errorMsg = "Unknown error";
    }
  } else if (error instanceof AxiosError) {
    switch (error.status) {
      case 400: {
        errorMsg = "Yêu cầu không hợp lệ";
        break;
      }
      case 500: {
        errorMsg = "Lỗi hệ thống";
        break;
      }
      default:
        errorMsg = "Lỗi mạng";
    }
  } else {
    errorMsg = "Lỗi không xác định";
  }

  return errorMsg;
}
