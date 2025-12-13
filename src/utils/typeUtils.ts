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
    typeof obj === "object" &&
    obj !== null &&
    key in obj &&
    checkType((obj as any)[key])
  );
}

export function isRecord(o: unknown): o is Record<string | number, unknown> {
  return typeof o === "object" && o !== null;
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

export function isArray(v: unknown): v is Array<any> {
  return Array.isArray(v);
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
  if (hasKeyOfType(value, "fileList", isArray)) {
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
