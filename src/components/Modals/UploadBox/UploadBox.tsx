import usePopupMessage from "@/hooks/usePopupMessage";
import { axiosClientForm, axiosClientJson } from "@/libraries/axiosClient";
import { ASSET_URL } from "@/utils/constants/URLS";
import { devLog } from "@/utils/logger";
import { appendDomain, createFormData } from "@/utils/stringUtils";
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
import { PreviewLayer } from "@/components/Images/PreviewLayer";
import { DeletableImage } from "@/components/Images/WithButton";
import { produce } from "immer";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileField } from "utils/types/Form";
import useFileUploadBox from "./useFileUploadBox";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// const fileWidth=100;
// const modalWidth=600;

// uploadTo = gcs-upload
export default function FileUploadBox({
  fields,
  uploadTo = `/upload`,
  modalTitle,
}: {
  fields: FileField[];
  uploadTo?: string;
  refetch?: () => void;
  modalTitle?: string | ((record: unknown) => string);
}) {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const queryKey =
    useFileUploadBox((state) => state.queryKey) ??
    searchParams.toString().split("&");
  const uploadBoxContent = useFileUploadBox((s) => s.boxContent);
  const setBoxContent = useFileUploadBox((s) => s.setBoxContent);
  const setQueryKey = useFileUploadBox((s) => s.setQueryKey);
  const open = useFileUploadBox((s) => s.open);
  const setOpen = useFileUploadBox((s) => s.setOpen);

  const {
    startLoading,
    loadingSuccess,
    loadingWarning,
    loadingError,
    contextHolder,
  } = usePopupMessage();

  const { collection, item } = uploadBoxContent
    ? uploadBoxContent
    : {
        collection: undefined,
        item: undefined,
      };
  const id = uploadBoxContent?.item?._id;
  const qKey = [`get_${collection}`, ...queryKey];

  const [fileFields, setFileFields] = useState<
    ({ currentFileList: UploadFile[] } & FileField)[]
  >(() =>
    fields.map((field) => ({
      name: field.name,
      maxCount: field.maxCount ?? 1,
      currentFileList: [],
      sizes: field.sizes,
      fileType: field.fileType,
    }))
  );

  useEffect(() => {
    if (!uploadBoxContent) {
      setFileFields(fields.map((field) => ({ ...field, currentFileList: [] })));
    }
  }, [uploadBoxContent]);

  const title =
    typeof modalTitle === "function"
      ? modalTitle(item)
      : modalTitle ||
        (item ? item?.name || `${collection || ""} ${item?._id || ""}` : "");

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        onOk={async () => {
          setOpen(false);
          if (!collection || !item) {
            setBoxContent(null);
            setQueryKey?.([]);
            return;
          }
          startLoading("Đang xử lí");
          // Previous data for rollback
          const previousCache = queryClient.getQueryData<{
            results: { _id: string }[];
          }>(qKey);
          // devLog("previousCache", previousCache);
          const updateBody: Partial<typeof item> = {};
          try {
            const fileUploadPromises = fileFields
              .filter((elem) => elem.currentFileList.length > 0)
              .map((elem) =>
                (async function () {
                  const { maxCount = 1, currentFileList, name, sizes } = elem;
                  const multiFiles = currentFileList
                    .map((item) => item.originFileObj)
                    .slice(0, maxCount);
                  const formData = createFormData(multiFiles);
                  if (!formData) {
                    return null;
                  }
                  if (sizes) {
                    formData.append("sizes", JSON.stringify(sizes));
                  }
                  const response = await axiosClientForm.postForm<{
                    publicUrls: string[];
                  }>(`${uploadTo}`, formData);
                  const {
                    data: { publicUrls },
                  } = response;
                  let fieldValue: string | string[] = "";
                  if (maxCount === 1) {
                    fieldValue = publicUrls[0];
                  } else {
                    const oldArray: string[] = Array.isArray(item[name])
                      ? (item[name] as string[])
                      : [];
                    fieldValue = [...publicUrls, ...oldArray].slice(
                      0,
                      maxCount
                    );
                  }
                  updateBody[name] = fieldValue;
                  return response.data;
                })()
              );
            const settled = await Promise.allSettled(fileUploadPromises);
            const succeedPromises = settled.filter(
              (
                p
              ): p is {
                status: "fulfilled";
                value: { publicUrls: string[] };
              } => p.status === "fulfilled"
            );
            // Cập nhật dữ liệu
            await axiosClientJson.patch(`/${collection}/${id}`, updateBody);
            if (succeedPromises.length === fileUploadPromises.length) {
              loadingSuccess("Cập nhật thành công");
            } else {
              loadingWarning(
                `Tải lên thành công ${succeedPromises.length}/${fileUploadPromises.length} file`
              );
            }

            // Optimistic update
            // await queryClient.cancelQueries({
            //   queryKey: [`get_${collection}`],
            // });
            // queryClient.setQueryData<{ results: { _id: string }[] }>(
            //   qKey,
            //   (data) => {
            //     if (!data) {
            //       return undefined;
            //     }
            //     const { results: oldArray } = data;
            //     const newArray = oldArray
            //       ? oldArray.map((elem) =>
            //           elem?._id === id ? { ...elem, ...updateBody } : elem
            //         )
            //       : [];
            //     // devLog("newArray", newArray);
            //     return { ...data, results: newArray };
            //   }
            // );
            queryClient.invalidateQueries({ queryKey: [`get_${collection}`] });
            // await refetch?.();
          } catch (error) {
            devLog(error);
            loadingError("Tải lên thất bại");
            // Rollback
            queryClient.setQueryData(qKey, previousCache);
          } finally {
            setBoxContent(null);
            setQueryKey?.([]);
          }
        }}
        onCancel={() => {
          setBoxContent(null);
          setOpen(false);
        }}
        title={title}
        cancelText="Hủy"
        okText="Lưu"
      >
        {fields.map((field, i) => {
          const { name } = field;
          const nodeKey = `${name}_${i}`;
          return (
            <React.Fragment key={nodeKey}>
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
        <PreviewLayer />
      </Modal>
    </>
  );
}

function UploaderWithList({
  field,
  collection,
  item,
  onChange,
  showing,
}: {
  field: FileField;
  collection?: string;
  item?: { _id: string; [k: string]: unknown };
  onChange: (fileList: UploadFile[]) => void;
  showing?: number;
}) {
  const {
    name,
    label = name,
    fileType = "unknown",
    maxCount = 1,
    sizes,
  } = field;
  showing ??= maxCount;
  const queryClient = useQueryClient();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // Source của file trên client
  const [clientFileSources, setClientFileSources] = useState<string[]>([]);
  const boxContent = useFileUploadBox((s) => s.boxContent);
  const setBoxContent = useFileUploadBox((s) => s.setBoxContent);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const validFiles = fileList
      .map((clientFile) => clientFile.originFileObj)
      .filter((file): file is FileType => !!file);

    Promise.allSettled(validFiles.map(getBase64))
      .then((results) =>
        results
          .filter(
            (result): result is PromiseFulfilledResult<string> =>
              result.status === "fulfilled"
          )
          .map((result) => result.value)
      )
      .then((sources) => setClientFileSources(sources))
      .catch((error) => {
        devLog(error);
        messageApi.error("Lỗi không xác định");
      });
  }, [fileList]);

  useEffect(() => {
    setFileList([]);
  }, [boxContent]);

  if (!name || !collection) {
    return null;
  }

  let serverSources =
    (item?.[field.name] as string | string[] | undefined) ?? [];

  if (typeof serverSources === "string") {
    serverSources = [serverSources];
  }

  const serverListLength = serverSources.length;

  const nMore = Math.min(
    0,
    serverListLength + clientFileSources.length - showing
  );

  const sizeStr = sizes
    ? ` (${sizes.map((s) => `${s[0]}x${s[1]}`).join(", ")})`
    : "";

  return (
    <>
      <Flex vertical gap={"1rem"} className="mb-2">
        {label} (Tối đa {maxCount}, {sizeStr}):
        <Flex align="center">
          <Upload
            key={name}
            maxCount={maxCount}
            multiple={maxCount > 1}
            listType={fileType === "image" ? "picture-card" : "text"}
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
            {clientFileSources.slice(0, showing).map((src, i, arr) => {
              const onDelete = () => {
                if (fileList.length === clientFileSources.length) {
                  const copyList = fileList.slice();
                  copyList.splice(i, 1);
                  setFileList(copyList);
                  onChange?.(copyList);
                } else {
                  messageApi.error("Xóa file không thành công!");
                }
              };
              if (fileType === "image") {
                return (
                  <li key={`client-${i}`}>
                    <DeletableImage
                      width={100}
                      height={100}
                      src={appendDomain(src, ASSET_URL)}
                      onDelete={onDelete}
                      listSrc={arr}
                      currentIndex={i}
                    />
                  </li>
                );
              } else {
                return (
                  <li key={`client-${i}`}>
                    <div className="flex justify-between">
                      {src}
                      <Popconfirm title="Xác nhận xóa" onConfirm={onDelete}>
                        <Button icon={<DeleteOutlined />} type="text" />
                      </Popconfirm>
                    </div>
                  </li>
                );
              }
            })}

            {serverSources
              .slice(0, Math.max(0, showing - clientFileSources.length))
              .map((src, i, arr) => {
                const deleteServerFile = async function () {
                  try {
                    if (maxCount <= 1) {
                      messageApi.error("Không thể xóa file duy nhất", 1);
                      return;
                    }
                    const newArray = arr.slice();
                    const [deletedItemUrl] = newArray.splice(i, 1);
                    const deleteUrl = `/gcs/delete/${
                      new URL(deletedItemUrl).pathname
                        .split("/")
                        .filter(Boolean)
                        .pop() ?? deletedItemUrl
                    }`;
                    const res1 = await axiosClientJson.patch<{
                      result: unknown;
                    }>(`/${collection}/${item?._id}`, {
                      [field.name]: newArray,
                    });
                    const res2 = await axiosClientJson.delete(deleteUrl);
                    messageApi.success("Cập nhật thành công", 1);
                    devLog({
                      updateDbResponse: res1,
                      deleteFileResponse: res2,
                    });
                    queryClient.invalidateQueries(
                      {
                        queryKey: [`get_${collection}`],
                      },
                      { cancelRefetch: true }
                    );
                    setBoxContent(
                      produce((old) => {
                        if (!old?.item || typeof old.item !== "object")
                          return old;
                        old.item[field.name] = newArray;
                      })
                    );
                  } catch (error) {
                    const msg =
                      error instanceof Error
                        ? error.message
                        : "Lỗi không xác định";
                    messageApi.error(msg);
                    devLog("Delete file error", error);
                  }
                };
                return (
                  <li key={`server-${i}`}>
                    {fileType === "image" ? (
                      <DeletableImage
                        width={100}
                        height={100}
                        className="object-contain"
                        src={appendDomain(src, ASSET_URL)}
                        onDelete={deleteServerFile}
                        listSrc={arr}
                        currentIndex={i}
                      />
                    ) : (
                      <div className="flex justify-between">
                        {src}
                        <Popconfirm
                          title="Xác nhận xóa"
                          onConfirm={deleteServerFile}
                        >
                          <Button icon={<DeleteOutlined />} type="text" />
                        </Popconfirm>
                      </div>
                    )}
                  </li>
                );
              })}

            {nMore > 0 && (
              <div className="w-25 h-25 text-2xl cursor-pointer flex justify-center items-center">
                +{nMore}
              </div>
            )}
          </ul>
        </Flex>
      </Flex>
      {contextHolder}
    </>
  );
}
