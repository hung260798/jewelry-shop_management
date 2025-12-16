import { RcFile } from "antd/es/upload";
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

/**
 * Append domain to the start of an url if it's not start with http(s)
 * @param src File's url (start with "/")
 * @param domain Domain to append
 * @returns Full url of resource
 */
export function appendDomain(src: string, domain: string = API_URL): string {
  if (typeof src !== "string" || typeof domain !== "string") {
    return src;
  }
  if (!src.startsWith("http") && src.startsWith("/")) {
    return domain + src;
  }
  return src;
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
  value: RcFile | (RcFile | undefined)[] | undefined,
  fieldName: string = "file"
) {
  const formData = new FormData();
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item) {
        formData.append(fieldName, item);
      }
    });
  } else {
    formData.append(fieldName, value);
  }
  return formData;
}
