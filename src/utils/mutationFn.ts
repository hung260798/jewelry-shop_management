import { axiosClientForm } from "@/libraries/axiosClient";
import { UploadFile } from "antd";
import { AxiosResponse } from "axios";
import { createFormData } from "utils/stringUtils";
import { hasFileKey, hasFileListKey, hasKeyOfType } from "utils/typeUtils";

export interface Config {
  type: "get" | "delete" | "patch" | "post" | "create" | "upload_file";
  collection: string;
  id?: string;
  data?: unknown;
  file?: { file: File; fileList: File[] } | null;
  files?: {
    [k: string]: File;
  };
}

type StringIndexedObject = { _id: string } & Record<string, unknown>;

export type GetManyData<T extends { _id: string } = StringIndexedObject> = {
  results: T[];
  amountResults: number;
};
export type UpdateData<T extends { _id: string } = StringIndexedObject> = {
  message: string;
  result: T;
};
export type AddData<T extends { _id: string } = StringIndexedObject> = {
  message: string;
  result: T;
};
export type DeleteData = AddData;
export type AddFileData = { publicUrl: string } & Record<string, unknown>;

interface UploadOpts {
  files: Record<
    string,
    {
      file: File;
      fileList: UploadFile[];
    }
  >;
  fields?: { name: string; maxCount?: number; sizes?: [number, number][] }[];
  uploadTo?: string;
}

/**
 * @throws AxiosError
 * @param files object must have type { fieldName: {file: File, fileList: UploadFile[]}}
 * @param fieldNames
 * @param uploadTo uploadUrl
 * @returns
 */
export async function upload({
  files,
  uploadTo = "/upload",
  fields,
}: UploadOpts) {
  fields ??= Object.keys(files).map((key) => ({ name: key, maxCount: 1 }));
  const promises: Promise<
    AxiosResponse<AddFileData | { publicUrls: string[] }>
  >[] = [];
  const validFields = fields.filter(
    ({ name }) =>
      hasKeyOfType(files, name, hasFileKey) &&
      hasKeyOfType(files, name, hasFileListKey)
  );

  for (const { name, maxCount = 1, sizes } of validFields) {
    let formData: FormData | null;
    const field = files[name];
    if (maxCount === 1) {
      const file = field.fileList[0].originFileObj;
      formData = createFormData(file, "file");
    } else {
      const fileList = field.fileList
        .map((item) => item.originFileObj)
        .filter((item) => item !== undefined);
      formData = createFormData(fileList, "file");
    }
    if (!formData) return;
    if (sizes) {
      formData.append("sizes", JSON.stringify(sizes));
    }
    promises.push(
      axiosClientForm.postForm<
        { publicUrl: string } | { publicUrls: string[] }
      >(`${uploadTo}?${maxCount > 1 ? "array=true" : ""}`, formData)
    );
  }

  const responses = await Promise.all(promises);
  const urls = responses.map(({ data }) => {
    if ("publicUrl" in data) {
      return data.publicUrl;
    } else if ("publicUrls" in data) {
      return data.publicUrls;
    }
  });
  const result = validFields
    .map(({ name }, i) => ({
      key: name,
      url: urls[i],
    }))
    .filter((item) => item.url !== undefined) as {
    key: string;
    url: string | string[];
  }[];
  return result;
}
