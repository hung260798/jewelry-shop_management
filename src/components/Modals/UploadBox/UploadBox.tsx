import { PreviewLayer } from "@/components/Images/PreviewLayer";
import usePopupMessage from "@/hooks/usePopupMessage";
import { axiosClientForm, axiosClientJson } from "@/libraries/axiosClient";
import { devLog } from "@/utils/logger";
import { createFormData, getBase64 } from "@/utils/stringUtils";
import { IdWise } from "@/utils/types/Entities";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, UploadFile } from "antd";
import _ from "lodash";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileField } from "utils/types/Form";
import FilePickerAndList from "./FilePickerAndList";
import styles from "./UploadBox.module.css";
import useFileUploadBox from "./useFileUploadBox";

// uploadTo = /upload/gcs-upload
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
  // console.log("UploadBox render");
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const boxContent_ = useFileUploadBox((s) => s.boxContent);
  const queryKey_ = useFileUploadBox((state) => state.queryKey) ?? [
    boxContent_?.collection,
  ];
  const setBoxContent = useFileUploadBox((s) => s.setBoxContent);
  const setQueryKey = useFileUploadBox((s) => s.setQueryKey);
  const open = useFileUploadBox((s) => s.open);
  const setOpen = useFileUploadBox((s) => s.setOpen);

  const messageApi = usePopupMessage()?.[0];
  const key = usePopupMessage()?.[2];

  const [fileFields_, setFileFields] = useState<
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

  const [markedServerFilesToDelete_, setMarkedServerFilesToDelete] = useState<
    [FileField, Set<string>][]
  >([]);

  function closeModal() {
    // Cleanup the modal
    setBoxContent(null);
    // Làm trống danh sách file đã chọn để upload
    setFileFields(fields.map((field) => ({ ...field, currentFileList: [] })));
    // Làm trống danh sách server file đã chọn để xoá
    setMarkedServerFilesToDelete([]);
    // Reset query key
    setQueryKey?.([]);
    // Đóng modal
    setOpen(false);
  }

  return (
    <Modal
      open={open}
      title={
        typeof modalTitle === "function"
          ? modalTitle(boxContent_?.item)
          : modalTitle ||
            boxContent_?.item.name ||
            `${boxContent_?.collection || ""} ${boxContent_?.item._id || ""}`
      }
      onOk={function onOK() {
        setOpen(false);
        if (!boxContent_) {
          return closeModal();
        }

        // Clone state trước khi đóng modal.
        const boxContentClone = _.clone(boxContent_);
        const fileFieldsClone = _.clone(fileFields_);
        const markedServerFilesToDelete = _.clone(markedServerFilesToDelete_);
        const queryKeyClone = _.clone(queryKey_);
        const qKey = [`${boxContentClone?.collection}`, ...queryKeyClone];
        const itemClone = _.clone(boxContentClone.item);
        const previousCache = queryClient.getQueryData<{
          results: IdWise[];
        }>(qKey);
        const nonEmptyFields = fileFieldsClone
          .filter((f) => f.currentFileList.length)
          .map((f) => {
            return { ...f, maxCount: f.maxCount || 1 };
          });

        try {
          const formDatas = nonEmptyFields
            .map((field) => {
              const fd = createFormData(
                field.currentFileList
                  .map((item) => item.originFileObj)
                  .filter((file) => file != null)
                  .slice(0, field.maxCount),
                "file"
              );
              fd?.append("sizes", JSON.stringify(field.sizes ?? []));
              return fd;
            })
            .filter((fd) => !!fd);
          if (
            formDatas.every((fd) => fd == null) &&
            !markedServerFilesToDelete_.length
          ) {
            // Không upload thêm file nào cũng không xoá đi file nào
            return closeModal();
          }

          if (formDatas.length != nonEmptyFields.length) {
            messageApi?.open({
              key,
              type: "error",
              content: "Lỗi khác",
              duration: 1,
            });
            return closeModal();
          }

          closeModal();

          messageApi?.open({
            key,
            type: "loading",
            content: "Đang xử lí",
            duration: 1,
          });

          // Object thể hiện các trường và các server file được chọn thủ công để xoá đi
          const manuallyDelete: {
            [fieldName: string]: Set<string> | undefined;
          } = markedServerFilesToDelete
            .filter(
              ([fieldInfo]) =>
                fieldInfo.maxCount != null && fieldInfo.maxCount > 1
            )
            .map(([fieldInfo, sources]) => {
              return { [fieldInfo.name]: sources };
            })
            .reduce(
              (prev, curr) => ({
                ...prev,
                ...curr,
              }),
              {}
            );

          const promiseBase64Srcs = fileFieldsClone
            .map((field) => field.currentFileList)
            .map((fileList) =>
              Promise.all(
                fileList
                  .map((uploadFile) => uploadFile.originFileObj)
                  .filter((file) => !!file)
                  .map(getBase64)
              )
            );

          const promiseUploadResponses = formDatas.map((fd, idx) =>
            axiosClientForm.postForm<{ publicUrls: string[] }>(uploadTo, fd)
          );

          Promise.all(promiseBase64Srcs)
            .then((arrArrSource) => {
              // Object thể hiện các trường và các client file được chọn để upload
              const uploaded = arrArrSource
                .map((arrSrc, fieldsIndex) => {
                  const field = fields[fieldsIndex];
                  return {
                    [field.name]: field.maxCount === 1 ? arrSrc[0] : arrSrc,
                  };
                })
                .reduce((p, c) => ({ ...p, ...c }), {});

              // Object này tổng hợp các trường và list file hiện tại
              const updateBody: Record<string, any> = {};
              // Tính toán updateBody
              fileFieldsClone.map((field) => {
                if (!field.maxCount || field.maxCount === 1) {
                  updateBody[field.name] = uploaded[field.name];
                } else {
                  const uploadedFiles =
                    (uploaded[field.name] as string[]) || [];
                  const oldFiles = (itemClone as any)[field.name] as string[];
                  const newArray = [...uploadedFiles, ...oldFiles]
                    .filter((src) => !manuallyDelete[field.name]?.has(src))
                    .slice(0, field.maxCount);
                  updateBody[field.name] = newArray;
                }
              });
              // Optimistic Update
              queryClient.setQueryData<{ results: IdWise[] } | undefined>(
                qKey,
                (prev) => {
                  if (!prev) return;
                  if (!Array.isArray(prev?.results)) return prev;
                  const copy = prev?.results.slice();
                  const foundIndex = copy?.findIndex(
                    (elem) => elem._id === itemClone._id
                  );
                  if (foundIndex < 0) return prev;
                  const found = copy[foundIndex];
                  copy[foundIndex] = {
                    ...found,
                    ...JSON.parse(JSON.stringify(updateBody)),
                  };
                  return { ...prev, results: copy };
                }
              );
            })
            .catch((error) => {
              messageApi?.open({
                key,
                type: "error",
                content: "Có lỗi khi xoá ảnh",
              });
            });

          Promise.all(promiseUploadResponses)
            .then((responses) =>
              responses.map((response, idx) => ({
                [nonEmptyFields[idx].name]:
                  nonEmptyFields[idx].maxCount == 1
                    ? response.data.publicUrls[0]
                    : response.data.publicUrls,
              }))
            )
            .then<{ [x: string]: string | string[] | undefined }>((uploaded) =>
              JSON.parse(
                JSON.stringify(uploaded.reduce((p, c) => ({ ...p, ...c }), {}))
              )
            )
            .then((added) => {
              // Danh sách tên trường có file thay đổi (thêm, bớt)

              const changedFieldsName = new Set([
                ...Object.getOwnPropertyNames(added),
                ...markedServerFilesToDelete.map((e) => e[0].name),
              ]);

              // Entries [k,v] của các trường có file thay đổi
              const oldItemEntries = Object.entries(itemClone)
                .filter(([k]) => changedFieldsName.has(k))
                .sort(([k1], [k2]) => k1.localeCompare(k2)) as [
                string,
                string | string[],
              ][];

              // Entries của item mới tương ứng
              const newItemEntries: typeof oldItemEntries = oldItemEntries.map(
                (e) => {
                  const [fieldName, old] = e;
                  const field = fileFieldsClone.find(
                    ({ name }) => name === fieldName
                  );
                  if (!field) {
                    return e;
                  }
                  const { maxCount = 1 } = field!;
                  const addedFiles = added[fieldName];
                  const newFiles =
                    maxCount === 1
                      ? (addedFiles ?? old)
                      : [...(addedFiles ?? []), ...(old as string[])]
                          .filter((src) => !manuallyDelete[fieldName]?.has(src))
                          .slice(0, maxCount);
                  return [fieldName, newFiles];
                }
              );

              // Body của request cập nhật
              const updateReqBody = Object.fromEntries(newItemEntries);

              // Mảng source của các file cần xoá trên server
              const filesToDelete = oldItemEntries
                .map(([k, v], idx) => {
                  if (!Array.isArray(v)) {
                    if (v !== newItemEntries[idx][1]) {
                      return v;
                    }
                    return;
                  }
                  return _.difference(
                    [...(added[k] || []), ...v],
                    updateReqBody[k]
                  );
                })
                .filter((v) => v != null)
                .flat();

              // Mảng các request sẽ được gửi
              const promises = [];
              if (Object.getOwnPropertyNames(updateReqBody).length) {
                const promiseUpdate = axiosClientJson.patch(
                  `/${boxContentClone.collection}/${boxContentClone.item._id}`,
                  updateReqBody
                );
                promises.push(promiseUpdate);
              }

              if (filesToDelete.length) {
                const promiseDelete = axiosClientJson
                  .post(`/gcs/bulk-removal`, {
                    files: filesToDelete,
                  })
                  .catch((error) => {
                    messageApi?.open({
                      key,
                      type: "error",
                      content: "Lỗi khi xoá ảnh",
                    });
                  });
                promises.push(promiseDelete);
              }
              return Promise.allSettled(promises);
            })
            .then(() => {
              messageApi?.open({
                key,
                type: "success",
                content: "Cập nhật thành công",
              });
            })
            .catch((error) => {
              messageApi?.open({
                key,
                type: "error",
                content: "Cập nhật thất bại",
              });
              // Rollback optimistic update nếu request fail
              queryClient.setQueryData(qKey, previousCache);
            });
        } catch (error) {
          messageApi?.open({
            key,
            type: "error",
            content: "Tải lên thất bại",
          });
        }
      }}
      onCancel={function onCancel() {
        closeModal();
      }}
      width={780}
      centered
      cancelText="Hủy"
      okText="Lưu"
    >
      <div className={styles.modalIntro}>
        <div>
          <div className={styles.modalIntroTitle}>Quản lý tài nguyên</div>
          <div className={styles.modalIntroSubtitle}>
            Thêm hoặc thay đổi file cho mục đang chọn một cách trực quan.
          </div>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
          Hỗ trợ nhiều file
        </div>
      </div>
      <div className="space-y-3">
        {fields.map((field, i) => (
          <React.Fragment key={`${boxContent_?.item._id}_${field.name}_${i}`}>
            <FilePickerAndList
              field={field}
              collection={boxContent_?.collection}
              item={boxContent_?.item}
              onChange={(fileList, type) => {
                if (type === "local")
                  setFileFields((prev) => {
                    return prev.map((item) => {
                      if (item.name === field.name) {
                        return {
                          ...item,
                          currentFileList: fileList as UploadFile[],
                        };
                      }
                      return item;
                    });
                  });
                else {
                  setMarkedServerFilesToDelete((prev) => {
                    const index = prev.findIndex(
                      ([fieldInfo]) => fieldInfo.name === field.name
                    );
                    return [
                      ...prev.slice(0, index),
                      [field, fileList as Set<string>],
                      ...prev.slice(index + 1),
                    ];
                  });
                }
              }}
            />
          </React.Fragment>
        ))}
      </div>
      <PreviewLayer />
    </Modal>
  );
}
