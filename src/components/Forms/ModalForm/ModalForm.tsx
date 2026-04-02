import { axiosClientJson } from "@/libraries/axiosClient";
import { upload } from "@/utils/mutationFn";
import { excludeDomain } from "@/utils/stringUtils";
import { Form, message, Modal, UploadFile } from "antd";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { devLog } from "@/utils/logger";
import { useScreen } from "@/hooks/useWidth";
import { FormProps } from "@/utils/types/Form";
import { ModalProps } from "antd";
import { useModalForm } from "@/components/Forms/ModalForm/useModalForm";
import { getErrorMessage } from "@/utils/logger";

type ModalFormProps = Omit<FormProps, "formValues"> & {
  modalProps?: ModalProps;
};

export const ModalForm = ({
  submitFn,
  formControls = [],
  title = "Form",
  modalProps = {},
  collectionName,
  fileFields,
}: ModalFormProps) => {
  const [form] = Form.useForm();
  const breakpoint = 768;
  const isSmallScreen = useScreen(breakpoint);
  const [messageApi, contextHolder] = message.useMessage();
  const {
    title: showingTitle,
    setTitle: setShowingTitle,
    formValues: initialValues,
    setFormValues,
    setFieldsChange,
    fieldsChange,
  } = useModalForm((s) => s);

  // const { collectionName, formControls, fileFields } = props;
  const queryClient = useQueryClient();
  /**
   * @param data form data
   * @returns Promise<void>
   */
  const submitFn2 =
    submitFn ??
    (async (data: unknown) => {
      // devLog("form values", data);
      // devLog("initialValues", initialValues);
      // return;
      const validData =
        collectionName != "" && data != null && typeof data == "object";
      if (!validData) {
        return;
      }
      const dataObj = data as Record<string, unknown>;
      for (const key in dataObj) {
        const control = formControls.find((control) => control.name === key);
        if (control) {
          const transformFn = control.onSubmit;
          if (transformFn) {
            dataObj[key] = transformFn(dataObj[key]);
          }
        }
      }
      const method = initialValues ? "patch" : "post";
      try {
        const { files, ...text } = data as { _id: string; files?: unknown };
        const submitUrl = `/${collectionName}${
          initialValues ? `/${text._id}` : ""
        }`;
        const response = await axiosClientJson<{ result: { _id: string } }>({
          method: method,
          url: submitUrl,
          data: text,
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
    });

  const isFormShowing = showingTitle === title && showingTitle !== null;

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    closeModalAndCleanUp();
  };

  const closeModalAndCleanUp = () => {
    setShowingTitle(null);
    setFormValues(undefined);
  };

  useEffect(
    function () {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    },
    [initialValues, isFormShowing, form]
  );

  const handleSubmit = async function (values: unknown) {
    if (!fieldsChange) {
      return closeModalAndCleanUp();
    }
    if (typeof values === "object" && values) {
      messageApi.open({
        key: "submit",
        content: "Đang cập nhật",
        type: "loading",
      });
      const lodash = await import("lodash");
      const valuesClone = lodash.cloneDeep(values);
      submitFn2(valuesClone);
    }
    closeModalAndCleanUp();
  };
  return (
    <Modal
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      open={isFormShowing}
      title={title}
      width={isSmallScreen ? "100%" : "1000px"}
      {...modalProps}>
      {contextHolder}
      <div className="px-6 pt-2 pb-4">
        <Form
          form={form}
          onValuesChange={() => {
            setFieldsChange((s) => {
              if (s === false) {
                return true;
              }
              return s;
            });
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
              rules = initialValues ? rules.update : rules.add;
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
