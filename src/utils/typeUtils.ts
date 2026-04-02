import { UploadFile } from "antd";
// import { isString } from "lodash";

// class TypeUtils {
//   obj: unknown;

//   constructor(obj: unknown) {
//     this.obj = obj;
//   }

//   isRecord(): this is { obj: Record<string | number, unknown> } {
//     return typeof this.obj === "object" && this.obj !== null;
//   }

//   hasKeyOfType<T, K extends string>(
//     key: K,
//     checkType: (v: unknown) => v is T
//   ): this is { obj: { [key in K]: T } } {
//     return (
//       this.isRecord() &&
//       key in this.obj &&
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       checkType((this.obj as any)[key])
//     );
//   }

//   hasShape<T>(
//     shape: Record<keyof T, (v: unknown) => boolean>
//   ): this is { obj: T } {
//     if (!this.isRecord()) {
//       return false;
//     }
//     for (const key in shape) {
//       if (!(key in this.obj)) {
//         return false;
//       }
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       if (!shape[key]((this.obj as any)[key])) {
//         return false;
//       }
//     }
//     return true;
//   }

//   get<T = unknown>() {
//     return this.obj as T;
//   }
// }

// type User = { name: string; addr: string };

// const typeUtils = new TypeUtils({ a: 1, b: 2 });
// if (
//   typeUtils.hasShape<User>({
//     name: isString,
//     addr: isString,
//   })
// ) {
//   //
//   const o = typeUtils.get<User>();
// }

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkType((obj as any)[key])
  );
}

export function hasShape<T>(
  obj: unknown,
  shape: Record<keyof T, (v: unknown) => boolean>
): obj is T {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  for (const key in shape) {
    if (!(key in obj)) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!shape[key]((obj as any)[key])) {
      return false;
    }
  }
  return true;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
