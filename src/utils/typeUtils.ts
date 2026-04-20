import { UploadFile } from "antd";

/**
 * Check if an object has a key of a specific type
 * @param obj Object to check
 * @param key Key to check
 * @param checkType Type guard function to check the type of the key
 * @returns
 */
export function hasKeyOfType<T, K extends string>(
  obj: unknown,
  key: K,
  checkType: (v: unknown) => v is T
): obj is { [key in K]: T } {
  return (
    isRecord(obj) &&
    key in obj &&
    checkType((obj as Record<string, unknown>)[key])
  );
}

export function hasShape<T>(
  obj: unknown,
  shape: {
    [key in keyof T]: (v: unknown) => v is T[key];
  }
): obj is T {
  if (!isRecord(obj)) {
    return false;
  }
  for (const key in shape) {
    if (!(key in obj)) {
      return false;
    }
    if (!shape[key]((obj as Record<string, unknown>)[key])) {
      return false;
    }
  }
  return true;
}

export function isRecord(o: unknown): o is Record<string | number, unknown> {
  return (
    typeof o === "object" &&
    o !== null &&
    Object.getPrototypeOf(o) === Object.prototype
  );
}

/**
 * Predicate that value has type {file: File}
 * @param value
 * @returns
 */
export function hasFileKey(obj: unknown): obj is { file: File } {
  return hasKeyOfType(obj, "file", isFile);
}

export function isFile(v: unknown): v is File {
  return v instanceof File;
}

/**
 * Predicate that value has type {fileList: UploadFile[]}, fileList has at least 1 element
 * @param value
 * @returns
 */
export function hasFileListKey(
  value: unknown
): value is { fileList: UploadFile[] } {
  let hasFileList = false;
  let fileListIsUploadFile = false;
  if (hasKeyOfType(value, "fileList", Array.isArray)) {
    hasFileList = true;
    const { fileList } = value;
    if (fileList.length > 0) {
      const elem: unknown = fileList[0];
      if (hasKeyOfType(elem, "originFileObj", isFile)) {
        fileListIsUploadFile = true;
      }
    }
  }
  return hasFileList && fileListIsUploadFile;
}
