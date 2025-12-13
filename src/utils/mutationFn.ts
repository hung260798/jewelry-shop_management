import { axiosClientForm, axiosClientJson } from "@/libraries/axiosClient";
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

/** @throws AxiosError */
export const mutationFn = async (cfg: Config) => {
  const { type, collection, id, data, files } = cfg;
  switch (type.toUpperCase()) {
    case "GET": {
      const result = await axiosClientJson.get<GetManyData>(`/${collection}`);
      return result.data;
    }
    case "DELETE": {
      const response1 = await axiosClientJson.get(`/${collection}/${id}`);
      const documentToDelete = response1.data.result;
      if (!documentToDelete) {
        throw new Error("Document not found");
      }
      if (documentToDelete.isDeleted) {
        const result = await axiosClientJson.delete<DeleteData>(
          `/${collection}/${id}`
        );
        return result.data;
      }
      const result = await axiosClientJson.patch<UpdateData>(
        `/${collection}/${id}`,
        {
          isDeleted: true,
        }
      );
      return result.data;
    }
    case "PATCH": {
      const result = await axiosClientJson.patch<UpdateData>(
        `/${collection}/${id}`,
        data
      );
      if (!files) {
        return result.data;
      }
      const promises: Promise<AxiosResponse>[] = [];
      for (const field in files) {
        if (!files[field]) continue;
        const formData = new FormData();
        formData.append("file", files[field]);
        promises.push(
          axiosClientForm.post(
            `/upload/${collection}/${id}?field=${field}`,
            formData
          )
        );
      }
      await Promise.allSettled(promises);
      return result.data;
    }
    case "CREATE":
    case "POST": {
      const result = await axiosClientJson.post<AddData>(
        `/${collection}`,
        data
      );
      if (!files) {
        return result.data;
      }
      const { _id } = result.data.result;
      const promises: Promise<AxiosResponse>[] = [];
      for (const field in files) {
        const formData = new FormData();
        formData.append("file", files[field]);
        promises.push(
          axiosClientForm.post(
            `/upload/${collection}/${_id}?field=${field}`,
            formData
          )
        );
      }
      await Promise.allSettled(promises);
      return result.data;
    }
    case "UPLOAD_FILE": {
      const promises: Promise<AxiosResponse<AddFileData>>[] = [];
      for (const field in files) {
        const formData = new FormData();
        formData.append("file", files[field]);
        promises.push(axiosClientForm.post<AddFileData>(`/upload`, formData));
      }
      const results = (await Promise.all(promises)).map((item) => item.data);
      return results;
      break;
    }
    default:
      throw new Error("Invalid request type", { cause: "mutationFn" });
  }
};

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
