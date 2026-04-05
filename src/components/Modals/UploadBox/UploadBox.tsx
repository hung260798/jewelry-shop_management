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
import { PreviewLayer } from "components/images/ImagesPreview";
import { DeletableImage } from "components/images/WithButton";
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
  const payload = useFileUploadBox((s) => s.payload);
  const setPayload = useFileUploadBox((s) => s.setPayload);
  const setQueryKey = useFileUploadBox((s) => s.setQueryKey);
  const open = useFileUploadBox((s) => s.open);
  const setOpen = useFileUploadBox((s) => s.setOpen);

  const { startLoading, loadingSuccess, loadingWarning, contextHolder } =
    usePopupMessage();

  const { collection, id, item } = payload ?? {
    collection: undefined,
    id: undefined,
    item: undefined,
  };
  const qKey = [`get_${collection}`, ...queryKey];

  const defaultFileFields = fields.map((item) => ({
    name: item.name,
    maxCount: item.maxCount ?? 1,
    currentFileList: [],
    sizes: item.sizes,
    fileType: item.fileType,
  }));

  const [fileFields, setFileFields] =
    useState<({ currentFileList: UploadFile[] } & FileField)[]>(
      defaultFileFields
    );
  useEffect(() => {
    if (!payload) {
      setFileFields(defaultFileFields);
    }
  }, [payload]);

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
          if (!collection || !id || !item) {
            setPayload(null);
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
            message.error("upload fail", 1);
            // Rollback
            queryClient.setQueryData(qKey, previousCache);
          } finally {
            setPayload(null);
            setQueryKey?.([]);
          }
        }}
        onCancel={() => {
          setOpen(false);
          setPayload(null);
        }}
        title={title}
        cancelText="Hủy"
        okText="Lưu">
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
      </Modal>
      <PreviewLayer />
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
  item?: { _id: string; [k: string]: unknown };
  collection?: string;
  // fileFields?: FileField[];
  field: FileField;
} & {
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
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // Source của file trên client
  const [clientFileSources, setClientFileSources] = useState<string[]>([]);
  const payload = useFileUploadBox((s) => s.payload);
  const queryClient = useQueryClient();
  const setPayload = useFileUploadBox((s) => s.setPayload);

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
        message.error("Lỗi không xác định");
      });
  }, [fileList]);

  useEffect(() => {
    setFileList([]);
  }, [payload]);

  if (!name || !item || !collection) {
    return null;
  }

  const serverListLength =
    item && collection
      ? Array.isArray(item[field.name])
        ? (item[field.name] as unknown[]).length
        : 0
      : 0;

  const nMore = Math.min(
    0,
    serverListLength + clientFileSources.length - showing
  );

  const sizeStr = sizes
    ? ` (${sizes.map((s) => `${s[0]}x${s[1]}`).join(", ")})`
    : "";

  let serverSources =
    (item?.[field.name] as string | string[] | undefined) ?? [];

  if (typeof serverSources === "string") {
    serverSources = [serverSources];
  }

  return (
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
          fileList={fileList}>
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
                message.error("Xóa file không thành công!");
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
              const onDelete = async function () {
                if (maxCount <= 1) {
                  message.info("Không thể  xóa file duy nhất", 1);
                  return;
                }
                try {
                  const newArray = arr.slice();
                  newArray.splice(i, 1);
                  await axiosClientJson.patch<{
                    result: unknown;
                  }>(`/${collection}/${item._id}`, {
                    [field.name]: newArray,
                  });
                  message.success("Success", 1);
                  queryClient.invalidateQueries(
                    {
                      queryKey: [`get_${collection}`],
                    },
                    { cancelRefetch: true }
                  );
                  setPayload(
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
                  message.error(msg);
                }
              };
              if (fileType === "image") {
                return (
                  <li key={`server-${i}`}>
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
                  <li key={`server-${i}`}>
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

          {nMore > 0 && (
            <div className="w-25 h-25 text-2xl cursor-pointer flex justify-center items-center">
              +{nMore}
            </div>
          )}
        </ul>
      </Flex>
    </Flex>
  );
}
