import { GetProp } from "antd";
import { RcFile, UploadProps } from "antd/es/upload";
import { API_URL } from "utils/constants/URLS";

/**
 * Exclude domain from an an url
 * @param src File's url (start with "/")
 * @param domain Domain to exclude
 * @returns Relative url of resource
 */
export function excludeDomain(url: string, domain: string = API_URL) {
  if (typeof url !== "string" || typeof domain !== "string") {
    return url;
  }
  if (url.startsWith(domain)) {
    return url.replace(domain, "");
  }
  return url;
}

function safeJoinUrl(domain: string, path: string) {
  if (!domain) throw new Error("Missing domain");
  if (!path) path = "";

  // 1. Domain phải là absolute URL
  let base;
  try {
    base = new URL(domain);
  } catch {
    throw new Error("Invalid domain");
  }

  // 2. Path KHÔNG được là absolute URL
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path)) {
    throw new Error("Path must be relative, not absolute URL");
  }

  // 3. Không cho protocol-relative (//evil.com)
  if (path.startsWith("//")) {
    throw new Error("Invalid path");
  }

  return new URL(path, base).href;
}

/**
 * Append domain to the start of an url if it's not start with http(s)
 * @param src File's url (start with "/")
 * @param domain Domain to append
 * @returns Full url of resource
 */
export function appendDomain(src: string, domain: string = API_URL): string {
  if (typeof src !== "string" || typeof domain !== "string" || !src) {
    return src;
  }
  try {
    return safeJoinUrl(domain, src);
  } catch {
    return src;
  }
}

export function extractPathname(src: string): string {
  const urlObj = new URL(src);
  return urlObj.pathname;
}

/**
 *
 * @param value file or file[]
 * @param fieldName field to append
 * @returns FormData/null
 */
export function createFormData(
  value: File | File[] | undefined,
  fieldName: string = "file",
  prevFormData?: FormData
) {
  if (!value) {
    return null;
  }
  const formData = prevFormData ?? new FormData();
  if (Array.isArray(value)) {
    if (!value.length) {
      return null;
    }
    value.forEach((item) => {
      if (item) {
        formData.append(fieldName, item);
      }
    });
    return formData;
  }
  formData.append(fieldName, value);
  return formData;
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getSortOrder(
  queryString: string,
  field: string
): "ascend" | "descend" | undefined {
  const params = new URLSearchParams(queryString);
  const sortByParam = params.get("sortBy");
  const sortOrderParam = params.get("sortOrder");
  if (!sortByParam) return undefined;

  if (sortByParam === field) {
    if (sortOrderParam === "asc" || sortOrderParam === "1") return "ascend";
    if (sortOrderParam === "desc" || sortOrderParam === "-1") return "descend";
  }
  return undefined;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
