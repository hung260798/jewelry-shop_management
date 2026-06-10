import { axiosClientJson } from "@/libraries/axiosClient";
import { useModalForm } from "@/components/Forms/ModalForm/useModalForm";
import {
  compareSearchParamsArray,
  defaultQueryObj,
  urlSearchParamsToArray,
} from "@/hooks/useMyQuery";
import { useScreen } from "@/hooks/useWidth";
import { devLog, getErrorMessage } from "@/utils/logger";
import { FormProps } from "@/utils/types/Form";
import { hasKeyOfType, hasShape, isRecord } from "@/utils/typeUtils";
import { QueryFilters, useQueryClient } from "@tanstack/react-query";
import { Form, message, Modal, ModalProps } from "antd";
import _ from "lodash";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export type ModalFormProps = Omit<FormProps, "formValues"> & {
  modalProps?: ModalProps;
};

export const ModalForm = ({
  submitFn,
  formControls,
  modalTitle: title = "Form",
  modalProps = {},
  collectionName,
  // fileFields,
}: ModalFormProps) => {
  const [form] = Form.useForm();
  const breakpoint = 768;
  const isSmallScreen = useScreen(breakpoint);
  const [messageApi, contextHolder] = message.useMessage();
  const { formValues, open, closeModal, formKey } = useModalForm((s) => s);
  const [searchParams] = useSearchParams();
  const httpMethod = formValues ? "patch" : "post";

  const queryClient = useQueryClient();
  const fieldsChanged = useRef<Record<string, unknown>>({});

  const closeModalAndCleanUp = () => {
    closeModal();
    fieldsChanged.current = {};
  };

  useEffect(
    function () {
      if (formValues) {
        form.setFieldsValue(formValues);
        form.validateFields();
      } else {
        try {
          const defaultValues: Record<string, unknown> = {};
          for (const { name, defaultValue } of formControls) {
            if (name != undefined && defaultValue != undefined) {
              if (typeof name === "string") {
                defaultValues[name] = defaultValue;
              } else {
                _.set(defaultValues, name, defaultValue);
              }
            }
          }
          form.setFieldsValue(defaultValues);
        } catch {
          form.resetFields();
        }
      }
    },
    [formValues, open, formControls, form]
  );

  useEffect(() => {
    return () => {
      closeModalAndCleanUp();
    };
  }, []);

  const handleSubmit = async function (values: object) {
    if (Object.keys(fieldsChanged.current).length === 0) {
      return closeModalAndCleanUp();
    }
    if (typeof values !== "object" || values == null) {
      return messageApi.error("Dữ liệu không hợp lệ");
    }
    if (!collectionName) {
      return messageApi.error("Dữ liệu không hợp lệ");
    }
    messageApi.open({
      key: "submit",
      content: "Đang cập nhật",
      type: "loading",
    });
    const lodash = await import("lodash");
    const data = lodash.clone(values);
    if (submitFn) {
      try {
        await submitFn(data);
        messageApi.open({
          key: "submit",
          content: "Cập nhật thành công",
          type: "success",
          duration: 1,
        });
      } catch (error) {
        devLog(error);
        messageApi.open({
          key: "submit",
          content: `Cập nhật thất bại, ${getErrorMessage(error)}`,
          type: "error",
          duration: 1,
        });
      }
      return closeModalAndCleanUp();
    }
    const method = formValues ? "patch" : "post";
    type IdWise = {
      _id: string;
      [key: string]: unknown;
    };
    try {
      const json = _.omit(data, "files") as IdWise;
      const submitUrl = `/${collectionName}${formValues ? `/${json._id}` : ""}`;
      const response = await axiosClientJson<{
        result: IdWise;
      }>({
        method: method,
        url: submitUrl,
        data: method === "post" ? json : fieldsChanged.current,
      });

      // Upload files if any
      // if (isRecord(files) && Object.keys(files).length > 0) {
      //   const safeFiles = files as Record<
      //     string,
      //     { file: File; fileList: UploadFile[] }
      //   >;
      //   const itemId = json._id ?? response.data.result._id;
      //   const fileURLs = await upload({
      //     files: safeFiles,
      //     fields: fileFields,
      //     uploadTo: "/upload/gcs-upload",
      //   });
      //   if (fileURLs) {
      //     const body = fileURLs
      //       .map((item) => {
      //         if (Array.isArray(item.url)) {
      //           item.url = item.url.map((u) => excludeDomain(u));
      //         } else {
      //           item.url = excludeDomain(item.url);
      //         }
      //         return item;
      //       })
      //       .reduce((prev, curr) => {
      //         return {
      //           ...prev,
      //           [curr.key]: curr.url,
      //         };
      //       }, {});
      //     await axiosClientJson.patch(`/${collectionName}/${itemId}`, body);
      //   }
      // }
      messageApi.open({
        key: "submit",
        content: "Cập nhật thành công",
        type: "success",
        duration: 1,
      });
      // queryClient.invalidateQueries({
      //   queryKey: [`get_${collectionName}`],
      // });
      const keyPredicate: QueryFilters["predicate"] = ({ queryKey }) => {
        if (queryKey.length <= 1) return false;
        if (queryKey[0] !== `get_${collectionName}`) return false;
        const paramsArray = urlSearchParamsToArray(searchParams);
        if (paramsArray.length === 0) {
          return compareSearchParamsArray(
            (queryKey as [string, string | string[]][]).slice(1),
            urlSearchParamsToArray(new URLSearchParams(defaultQueryObj))
          );
        }
        return compareSearchParamsArray(
          (queryKey as [string, string | string[]][]).slice(1),
          paramsArray
        );
      };
      await queryClient.cancelQueries({
        queryKey: [`get_${collectionName}`],
        predicate: keyPredicate,
      });
      queryClient.setQueriesData(
        {
          queryKey: [`get_${collectionName}`],
          predicate: keyPredicate,
        },
        (oldData: unknown) => {
          if (!isRecord(oldData)) {
            return oldData;
          }
          const responseData = response.data?.result;
          if (!responseData) {
            devLog("No response data");
            return oldData;
          }
          if (
            hasShape<{ results: IdWise[]; amountResults: number }>(oldData, {
              results: (v): v is IdWise[] => Array.isArray(v),
              amountResults: (v): v is number => typeof v === "number",
            })
          ) {
            const results = oldData.results;
            const amountResults = oldData.amountResults;
            if (method === "post") {
              return {
                ...oldData,
                results: [responseData, ...results],
                amountResults: amountResults + 1,
              };
            } else {
              return {
                ...oldData,
                results: results.map((item) =>
                  item._id === responseData._id ? responseData : item
                ),
              };
            }
          } else if (
            hasKeyOfType(oldData, "result", (v): v is IdWise =>
              hasKeyOfType(
                v,
                "_id",
                (id): id is string => typeof id === "string"
              )
            )
          ) {
            if (oldData.result._id === responseData._id) {
              return {
                ...oldData,
                result: responseData,
              };
            }
          } else {
            return oldData;
          }
        }
      );
    } catch (error) {
      devLog(error);
      messageApi.open({
        key: "submit",
        content: `Cập nhật thất bại, ${getErrorMessage(error)}`,
        type: "error",
        duration: 1,
      });
    } finally {
      queryClient.invalidateQueries({ queryKey: [`get_${collectionName}`] });
    }
    closeModalAndCleanUp();
  };

  const { width, ...restModalProps } = modalProps;

  return (
    <Modal
      onCancel={() => {
        closeModalAndCleanUp();
      }}
      onOk={() => {
        form.submit();
      }}
      okText="Lưu"
      cancelText="Hủy"
      open={open && formKey === collectionName}
      title={title}
      width={isSmallScreen ? "100%" : (width ?? 800)}
      modalRender={(dom) => (
        <Form
          form={form}
          onValuesChange={(changedValues) => {
            fieldsChanged.current = {
              ...fieldsChanged.current,
              ...changedValues,
            };
          }}
          onFinish={handleSubmit}
          onFinishFailed={(err) => {
            messageApi.error("Lỗi submit");
            devLog(err);
          }}
        >
          {dom}
        </Form>
      )}
      {...restModalProps}
    >
      {contextHolder}
      <div className="px-6 pt-2 pb-4">
        {formControls.map((item, index) => {
          const {
            component,
            valuePropName = "value",
            name,
            label,
            className,
            getValueProps,
            getValueFromEvent,
            normalize,
            method,
          } = item;

          if (method && method !== httpMethod) {
            return null;
          }

          if (!item.rules) {
            item.rules = [];
          } else if (!Array.isArray(item.rules)) {
            item.rules = formValues ? item.rules.update : item.rules.add;
          }
          const css = isSmallScreen ? { marginBottom: ".35rem" } : {};
          return (
            <Form.Item
              key={index}
              valuePropName={valuePropName}
              name={name}
              label={label}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              className={className || ""}
              getValueProps={getValueProps}
              getValueFromEvent={getValueFromEvent}
              normalize={normalize}
              rules={item.rules}
              style={css}
            >
              {typeof component === "function" ? (
                (() => {
                  const Component = component as React.FC<unknown>;
                  return <Component />;
                })()
              ) : (
                <>{component}</>
              )}
            </Form.Item>
          );
        })}
      </div>
    </Modal>
  );
};
