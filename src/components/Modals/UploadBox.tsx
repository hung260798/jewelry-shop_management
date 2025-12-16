import { axiosClientForm, axiosClientJson } from "@/libraries/axiosClient";
import { devLog } from "@/utils/logger";
import {
  appendDomain,
  createFormData,
  extractPathname,
} from "@/utils/stringUtils";
import { SetState } from "@/utils/types/Others";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Flex,
  GetProp,
  message,
  Modal,
  Popconfirm,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { PreviewLayer } from "components/images/ImagesPreview";
import { DeletableImage } from "components/images/WithButton";
import { produce } from "immer";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileField } from "utils/types/Form";
import { create } from "zustand";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

type IdAndName = { _id: string; name: string; [k: string]: unknown };

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

interface FileListProps {
  item?: { _id: string; [k: string]: unknown };
  collection?: string;
  // fileFields?: FileField[];
  field: FileField;
}

interface UploadBoxProps {
  fields: FileField[];
  uploadTo?: string;
  refetch?: () => void;
}

interface UploadBoxPayload<T extends { _id: string } = IdAndName> {
  collection: string;
  id: string;
  item: T;
}

interface StateFields<TPayload extends { _id: string } = IdAndName> {
  payload: UploadBoxPayload<TPayload> | null;
  queryKey?: unknown[];
}

type StateType<TPayload extends { _id: string } = IdAndName> =
  StateFields<TPayload> & {
    setPayload: SetState<StateFields<TPayload>["payload"]>;
    setQueryKey?: SetState<StateFields<TPayload>["queryKey"]>;
  };

export const useFileUploadBox = create<StateType>()((set) => {
  return {
    payload: null,
    setPayload(updater) {
      if (typeof updater === "function") {
        return set((prev) => ({ payload: updater(prev.payload) }));
      } else {
        set({ payload: updater });
      }
    },
    queryKey: [],
    setQueryKey(updater) {
      if (typeof updater === "function") {
        return set((prev) => ({ queryKey: updater(prev.queryKey) }));
      } else {
        set({ queryKey: updater });
      }
    },
  };
});

// const fileWidth=100;
// const modalWidth=600;

export default function FileUploadBox({
  fields,
  uploadTo = `/upload`,
}: UploadBoxProps) {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const queryKey =
    useFileUploadBox((state) => state.queryKey) ??
    searchParams.entries().toArray();
  const payload = useFileUploadBox((s) => s.payload);
  const setPayload = useFileUploadBox((s) => s.setPayload);
  const setQueryKey = useFileUploadBox((s) => s.setQueryKey);
  const { collection, id = "", item } = payload ?? ({} as UploadBoxPayload);
  const qKey = [`get_${collection}`, ...queryKey];

  const defaultFileFields = fields.map((item) => ({
    name: item.name,
    maxCount: item.maxCount ?? 1,
    currentFileList: [],
    sizes: item.sizes,
    fileType: item.fileType,
  }));

  type State = ({ currentFileList: UploadFile[] } & FileField)[];

  const [fileFields, setFileFields] = useState<State>(defaultFileFields);
  useEffect(() => {
    if (!payload) {
      setFileFields(defaultFileFields);
    }
  }, [payload]);

  const handleSubmit = async () => {
    if (!collection || !id || !item) return;
    // Previous data for rollback
    const previousCache = queryClient.getQueryData<{
      results: { _id: string }[];
    }>(qKey);
    // devLog("previousCache", previousCache);
    const updateBody: Partial<typeof item> = {};
    try {
      const namedPromises = fileFields
        .filter((elem) => elem.currentFileList.length > 0)
        .map((elem) => {
          return async function () {
            const { maxCount = 1, currentFileList, name, sizes } = elem;
            const multiple = maxCount > 1;
            const queryStr = multiple ? "array=true" : "";
            const multiFiles = currentFileList
              .map((item) => item.originFileObj)
              .slice(0, maxCount);
            const singleFile = currentFileList[0].originFileObj;
            const value = multiple ? multiFiles : singleFile;
            const formData = createFormData(value);
            if (!formData) {
              return null;
            }
            if (sizes) {
              formData.append("sizes", JSON.stringify(sizes));
            }
            const uploadResponse = await axiosClientForm.postForm<
              { publicUrl: string } | { publicUrls: string[] }
            >(`${uploadTo}?${queryStr}`, formData);
            // const { data } = uploadResponse;
            let fieldValue: string | string[] = "";
            if ("publicUrl" in uploadResponse.data) {
              fieldValue = extractPathname(uploadResponse.data.publicUrl);
            } else if ("publicUrls" in uploadResponse.data) {
              const oldArray = Array.isArray(item[name]) ? item[name] : [];
              fieldValue = [
                ...uploadResponse.data.publicUrls.map((url: string) =>
                  extractPathname(url)
                ),
                ...oldArray,
              ];
            }
            updateBody[name] = fieldValue;
            return uploadResponse.data;
          };
        });
      const settled = await Promise.allSettled(namedPromises.map((p) => p()));
      await axiosClientJson.patch(`/${collection}/${id}`, updateBody);
      const succeedPromises = settled.filter((p) => p.status === "fulfilled");
      if (succeedPromises.length === namedPromises.length) {
        message.success("Cập nhật thành công", 1);
      } else {
        message.warning(
          `Tải lên thành công ${succeedPromises.length}/${namedPromises.length} file`,
          1
        );
      }
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [`get_${collection}`] });
      queryClient.setQueryData<{ results: { _id: string }[] }>(qKey, (data) => {
        // devLog("collection", collection);
        // devLog("data", data);
        // devLog("updateBody", updateBody);
        if (!data) {
          return undefined;
        }
        const { results: oldArray } = data;
        const newArray = oldArray
          ? oldArray.map((elem) =>
              elem?._id === id ? { ...elem, ...updateBody } : elem
            )
          : [];
        // devLog("newArray", newArray);
        return { ...data, results: newArray };
      });
      // await refetch?.();
    } catch (error) {
      devLog(error);
      message.error("upload fail", 1);
      // Rollback
      queryClient.setQueryData(qKey, previousCache);
    } finally {
      setPayload(null);
      setQueryKey?.([]);
    }
  };
  const modalTitle = item
    ? item?.name || `${collection || ""} ${item?._id || ""}`
    : "";

  return (
    <>
      <Modal
        open={payload !== null}
        onOk={() => {
          handleSubmit();
        }}
        onCancel={() => {
          setPayload(null);
        }}
        title={modalTitle}
      >
        {fields.map((field, i) => {
          const { name } = field;
          const nodeKey = `${name}_${i}`;
          return (
            <React.Fragment key={nodeKey}>
              {/* <Flex vertical gap={"1rem"} className="mb-2">
                {label}:
                <Flex>
                  <Upload
                    key={name}
                    maxCount={maxCount}
                    multiple={maxCount > 1}
                    listType={fileType === "image" ? "picture-card" : "text"}
                    beforeUpload={() => false}
                    onChange={(info) => {
                      setFileFields((prev) => {
                        return prev.map((item) => {
                          if (item.name === name) {
                            return { ...item, currentFileList: info.fileList };
                          }
                          return item;
                        });
                      });
                    }}
                    fileList={
                      fileFields.find((item) => item.name === name)
                        ?.currentFileList || []
                    }
                  >
                    <Button
                      icon={<UploadOutlined style={{ fontSize: 24 }} />}
                      type="dashed"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Upload>
                  <FileList
                    field={field}
                    collection={collection}
                    item={item}
                    showLabel={false}
                  />
                </Flex>
              </Flex> */}
              <UploaderWithList
                field={field}
                collection={collection}
                item={item}
                onChange={(fileList) => {
                  setFileFields((prev) => {
                    return prev.map((item) => {
                      if (item.name === name) {
                        return { ...item, currentFileList: fileList };
                      }
                      return item;
                    });
                  });
                }}
              />
            </React.Fragment>
          );
        })}
        {/* <div>
          current:
          <FileLists fileFields={fields} collection={collection} item={item} />
        </div> */}
      </Modal>
      <PreviewLayer />
    </>
  );
}

/**
 * File list of an db item
 * @param param0
 * @returns
 */
// function FileLists({ item, fileFields, collection }: Props) {
//   // const queryClient = useQueryClient();
//   // const setPayload = useFileUploadBox((state) => state.setPayload);
//   // const maxShowing = 7;

//   if (!item || !collection || !fileFields) {
//     return null;
//   }

//   return (
//     <div>
//       {fileFields.map((field: FileField, arrayIndex: number) => {
//         const { name: fieldName } = field;

//         return (
//           <div key={`${fieldName} ${arrayIndex}`}>
//             <FileListOfItem collection={collection} item={item} field={field} />
//           </div>
//         );
//       })}
//     </div>
//   );
// }

function FileListOfItem({
  item,
  field,
  collection,
  showLabel = true,
  wrap = true,
  showing,
}: Omit<FileListProps, "fileFields"> & {
  showLabel?: boolean;
  wrap?: boolean;
  showing?: number;
}) {
  const queryClient = useQueryClient();
  const setPayload = useFileUploadBox((state) => state.setPayload);
  // const maxShowing = 7;

  if (!item || !collection || !field) {
    return null;
  }

  const { label, name: fieldName, maxCount = 1, fileType = "unknown" } = field;
  let sources = (item[fieldName] as string | string[] | undefined) ?? [];
  if (!Array.isArray(sources)) {
    sources = [sources];
  }
  showing ??= sources.length;
  showing = showing < 0 ? 0 : showing;
  const listServerItems = sources.slice(0, showing).map((src, i, arr) => {
    const onDeleteFileInArray = async function () {
      if (maxCount <= 1) {
        message.info("Không thể  xóa file duy nhất", 1);
        return;
      }
      try {
        const newArray = arr.slice();
        newArray.splice(i, 1);
        const response = await axiosClientJson.patch<{
          oke: string;
          result: unknown;
        }>(`/${collection}/${item._id}`, {
          [fieldName]: newArray,
        });
        message.success(response.data.oke, 1);
        queryClient.invalidateQueries(
          {
            queryKey: [`get_${collection}`],
          },
          { cancelRefetch: true }
        );
        // setPayload((old) => {
        //   if (!old?.item || typeof old.item !== "object") return old;
        //   return {
        //     ...old,
        //     item: {
        //       ...old.item,
        //       [fieldName]: newArray,
        //     },
        //   };
        // });
        // use immer
        setPayload(
          produce((old) => {
            if (!old?.item || typeof old.item !== "object") return old;
            old.item[fieldName] = newArray;
          })
        );
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Lỗi không xác định";
        message.error(msg);
      }
    };
    return (
      <li key={`server-${i}`}>
        <DeletableFileItem
          key={i}
          url={src}
          fileType={fileType}
          onDelete={onDeleteFileInArray}
        />
      </li>
    );
  });

  const listItems = listServerItems;
  return (
    <>
      {showLabel && <p>{label}</p>}
      {wrap ? (
        <ul className={`${maxCount > 1 ? "flex flex-wrap" : ""}`}>
          {listItems}
        </ul>
      ) : (
        listItems
      )}
    </>
  );
}

function DeletableFileItem({
  url,
  fileType,
  onDelete,
}: {
  url: string;
  fileType: string;
  onDelete?: () => void;
}) {
  onDelete ??= () => {
    message.info("Tính năng này chưa được phát triển", 1);
  };
  if (fileType === "image") {
    return (
      <DeletableImage
        width={100}
        height={100}
        src={appendDomain(url)}
        onDelete={onDelete}
      />
    );
  } else {
    return (
      <div className="flex justify-between">
        {url}
        <Popconfirm title="Xác nhận xóa" onConfirm={onDelete}>
          <Button icon={<DeleteOutlined />} type="text" />
        </Popconfirm>
      </div>
    );
  }
}

function UploaderWithList({
  field,
  collection,
  item,
  onChange,
  showing,
}: FileListProps & {
  onChange: (fileList: UploadFile[]) => void;
  showing?: number;
}) {
  const { name, label = name, fileType = "unknown", maxCount = 1 } = field;
  showing ??= maxCount;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [clientFileSources, setClientFileSources] = useState<string[]>([]);
  const payload = useFileUploadBox((s) => s.payload);
  const setPayload = useFileUploadBox((s) => s.setPayload);
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      devLog("clientFiles", fileList);
      const sourcePromises = fileList
        .map((clientFile) => clientFile.originFileObj)
        .filter((file) => !!file)
        .map((file) => getBase64(file));
      try {
        const sources = (await Promise.allSettled(sourcePromises))
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
        setClientFileSources(sources);
      } catch (error) {
        devLog(error);
        message.error("Lỗi không xác định");
      }
    })();
  }, [fileList]);

  useEffect(() => {
    setFileList([]);
  }, [payload]);

  if (!name) {
    return null;
  }

  const serverList = item && collection && (
    <FileListOfItem
      field={field}
      collection={collection}
      item={item}
      showLabel={false}
      wrap={false}
      showing={showing - clientFileSources.length}
    />
  );

  const serverList2 =
    item &&
    collection &&
    field.name &&
    ((Array.isArray(item[field.name]) &&
      (item[field.name] as string[]).map((src, i, arr) => {
        const fieldName = field.name;
        const onDeleteFileInArray = async function () {
          if (maxCount <= 1) {
            message.info("Không thể  xóa file duy nhất", 1);
            return;
          }
          try {
            const newArray = arr.slice();
            newArray.splice(i, 1);
            const response = await axiosClientJson.patch<{
              oke: string;
              result: unknown;
            }>(`/${collection}/${item._id}`, {
              [fieldName]: newArray,
            });
            message.success(response.data.oke, 1);
            queryClient.invalidateQueries(
              {
                queryKey: [`get_${collection}`],
              },
              { cancelRefetch: true }
            );
            // use immer
            setPayload(
              produce((old) => {
                if (!old?.item || typeof old.item !== "object") return old;
                old.item[fieldName] = newArray;
              })
            );
          } catch (error) {
            const msg =
              error instanceof Error ? error.message : "Lỗi không xác định";
            message.error(msg);
          }
        };
        return (
          <li key={`server-${i}`}>
            <DeletableFileItem
              key={i}
              url={src}
              fileType={fileType}
              onDelete={onDeleteFileInArray}
            />
          </li>
        );
      })) ||
      (typeof item[field.name] === "string" && (
        <DeletableFileItem
          // key={i}
          url={item[field.name] as string}
          fileType={fileType}
          onDelete={undefined}
        />
      )));

  const serverListLength =
    item && collection
      ? Array.isArray(item[field.name])
        ? (item[field.name] as unknown[]).length
        : 0
      : 0;

  const nMore = clientFileSources.length + serverListLength - showing;

  return (
    <Flex vertical gap={"1rem"} className="mb-2">
      {label} (Tối đa {maxCount}):
      <Flex>
        <Upload
          key={name}
          maxCount={maxCount}
          multiple={maxCount > 1}
          // listType={fileType === "image" ? "picture-card" : "text"}
          showUploadList={false}
          beforeUpload={() => false}
          onChange={(info) => {
            devLog("info", info);
            setFileList(info.fileList);
            onChange?.(info.fileList);
          }}
          fileList={fileList}
        >
          <Button
            icon={<UploadOutlined style={{ fontSize: 24 }} />}
            type="dashed"
            style={{ width: "100px", height: "100px" }}
          />
        </Upload>
        <ul className="flex flex-wrap">
          {clientFileSources.slice(0, showing).map((src, i) => (
            <li key={`client-${i}`}>
              <DeletableFileItem
                key={i}
                url={src}
                fileType={fileType}
                onDelete={() => {
                  if (fileList.length === clientFileSources.length) {
                    const copyList = fileList.slice();
                    copyList.splice(i, 1);
                    setFileList(copyList);
                    onChange?.(copyList);
                  } else {
                    message.error("Xóa file không thành công!");
                  }
                }}
              />
            </li>
          ))}
          {serverList}
          {nMore > 0 && (
            <div className="w-[100px] h-[100px] text-2xl cursor-pointer flex justify-center items-center">
              +{nMore}
            </div>
          )}
        </ul>
      </Flex>
    </Flex>
  );
}
