import { axiosClientJson } from "@/libraries/axiosClient";
import { upload } from "@/utils/mutationFn";
import { excludeDomain } from "@/utils/stringUtils";
import { Form, message, Modal, UploadFile } from "antd";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { devLog } from "@/utils/logger";
import { useScreen } from "@/hooks/useWidth";
import { FormProps } from "@/utils/types/Form";
import { ModalProps } from "antd";
import { useModalForm } from "@/components/Forms/ModalForm/useModalForm";
import { getErrorMessage } from "@/utils/logger";
import _ from "lodash";

type ModalFormProps = Omit<FormProps, "formValues"> & {
  modalProps?: ModalProps;
};

export const ModalForm = ({
  submitFn,
  formControls,
  title = "Form",
  modalProps = {},
  collectionName,
  fileFields,
}: ModalFormProps) => {
  const [form] = Form.useForm();
  const breakpoint = 768;
  const isSmallScreen = useScreen(breakpoint);
  const [messageApi, contextHolder] = message.useMessage();
  const { formValues, open, setOpen, setFormValues } = useModalForm((s) => s);

  const queryClient = useQueryClient();
  const fieldsChanged = useRef<Record<string, unknown>>({});

  const closeModalAndCleanUp = () => {
    setFormValues(undefined);
    setOpen(false);
    fieldsChanged.current = {};
  };

  useEffect(
    function () {
      if (formValues) {
        form.setFieldsValue(formValues);
      } else {
        const defaultValues: Record<string, unknown> = {};
        for (const { name, defaultValue } of formControls) {
          if (name !== undefined && defaultValue !== undefined) {
            if (typeof name === "string") {
              defaultValues[name] = defaultValue;
            } else {
              _.set(defaultValues, name, defaultValue);
            }
          }
        }
        form.setFieldsValue(defaultValues);
      }
    },
    [formValues, open, formControls, form]
  );

  const handleSubmit = async function (values: unknown) {
    if (Object.keys(fieldsChanged.current).length === 0) {
      return closeModalAndCleanUp();
    }
    if (typeof values === "object" && values) {
      messageApi.open({
        key: "submit",
        content: "Đang cập nhật",
        type: "loading",
      });
      const lodash = await import("lodash");
      const data = lodash.clone(values) as Record<string, unknown>;
      if (submitFn) {
        submitFn(data);
      } else {
        if (
          !(collectionName !== "" && data != null && typeof data === "object")
        ) {
          return;
        }
        for (const key in data) {
          const control = formControls.find((control) => control.name === key);
          if (control) {
            const transformFn = control.onSubmit;
            if (transformFn) {
              data[key] = transformFn(data[key]);
            }
          }
        }
        const method = formValues ? "patch" : "post";
        try {
          const { files, ...text } = data as {
            _id: string;
            files?: unknown;
          };
          const submitUrl = `/${collectionName}${
            formValues ? `/${text._id}` : ""
          }`;
          const response = await axiosClientJson<{ result: { _id: string } }>({
            method: method,
            url: submitUrl,
            data: method === "post" ? text : fieldsChanged.current,
          });

          // Upload files if any
          if (typeof files === "object" && files) {
            const safeFiles = files as Record<
              string,
              { file: File; fileList: UploadFile[] }
            >;
            const itemId = text._id ?? response.data.result._id;
            const fileURLs = await upload({
              files: safeFiles,
              fields: fileFields,
              uploadTo: "/upload/gcs-upload",
            });
            if (fileURLs) {
              const body = fileURLs
                .map((item) => {
                  if (Array.isArray(item.url)) {
                    item.url = item.url.map((u) => excludeDomain(u));
                  } else {
                    item.url = excludeDomain(item.url);
                  }
                  return item;
                })
                .reduce((prev, curr) => {
                  return {
                    ...prev,
                    [curr.key]: curr.url,
                  };
                }, {});
              await axiosClientJson.patch(`/${collectionName}/${itemId}`, body);
            }
          }
          messageApi.open({
            key: "submit",
            content: "Cập nhật thành công",
            type: "success",
            duration: 1,
          });
          queryClient.invalidateQueries({
            queryKey: [`get_${collectionName}`],
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
      }
    }
    closeModalAndCleanUp();
  };

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
      open={open}
      title={title}
      width={isSmallScreen ? "100%" : "1000px"}
      {...modalProps}>
      {contextHolder}
      <div className="px-6 pt-2 pb-4">
        <Form
          form={form}
          onValuesChange={(changedValues, values) => {
            console.log("changedValues", changedValues);
            console.log("values", values);
            fieldsChanged.current = {
              ...fieldsChanged.current,
              ...changedValues,
            };
            // setFieldsChange((s) => {
            //   if (s === false) {
            //     return true;
            //   }
            //   return s;
            // });
          }}
          onFinish={handleSubmit}
          onFinishFailed={(err) => {
            messageApi.error("Lỗi submit");
            devLog(err);
          }}>
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
            } = item;
            let { rules } = item;
            if (!rules) {
              rules = [];
            } else if (!Array.isArray(rules)) {
              rules = formValues ? rules.update : rules.add;
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
                className={`${className}`}
                getValueProps={getValueProps}
                getValueFromEvent={getValueFromEvent}
                normalize={normalize}
                rules={rules}
                style={css}>
                {component}
              </Form.Item>
            );
          })}
        </Form>
      </div>
    </Modal>
  );
};
