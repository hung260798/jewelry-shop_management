import { axiosClientJson } from "@/libraries/axiosClient";
import { upload } from "@/utils/mutationFn";
import { excludeDomain } from "@/utils/stringUtils";
import { SetState } from "@/utils/types/Others";
import { Form, message, Modal, ModalProps, UploadFile } from "antd";
import { useEffect } from "react";
import { FormProps } from "utils/types/Form";
import { create } from "zustand";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { devLog } from "@/utils/logger";
import { useScreen } from "@/hooks/useWidth";

interface ModalFormState {
  title: string | null;
  setTitle: SetState<string | null>;
  formValues: unknown;
  setFormValues: SetState<unknown>;
}

export const useModalForm = create<ModalFormState>()((set) => {
  return {
    title: null,
    setTitle(updater) {
      if (typeof updater === "function") {
        return set((state) => ({ title: updater(state.title) }));
      } else {
        return set({ title: updater });
      }
    },
    formValues: undefined,
    setFormValues(updater) {
      if (typeof updater === "function") {
        return set((state) => ({ formValues: updater(state.formValues) }));
      } else {
        return set({ formValues: updater });
      }
    },
  };
});

type ModalFormProps = Omit<FormProps, "formValues"> & {
  modalProps?: ModalProps;
};

export function ModalForm({
  submitFn,
  formControls = [],
  title = "Form",
  modalProps = {},
}: ModalFormProps) {
  const [form] = Form.useForm();
  const breakpoint = 768;
  const isSmallScreen = useScreen(breakpoint);
  const {
    title: showingTitle,
    setTitle: setShowingTitle,
    formValues: initialValues,
    setFormValues,
  } = useModalForm((s) => s);

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
    await submitFn?.(values);
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
      {...modalProps}
    >
      <div className="px-6 pt-2 pb-4">
        <Form
          form={form}
          onFinish={handleSubmit}
          onFinishFailed={(err) => {
            message.error("Lỗi submit");
            devLog(err);
          }}
        >
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
                style={css}
              >
                {component}
              </Form.Item>
            );
          })}
        </Form>
      </div>
    </Modal>
  );
}

export const simpleSubmit = async (
  data: unknown,
  submitUrl: string,
  method: "POST" | "PATCH",
  onSuccess?: () => void
) => {
  if (!data || typeof data !== "object" || !submitUrl) {
    return;
  }
  const dataObj = data as Record<string, unknown>;
  try {
    const response = await axiosClientJson<{ result: { _id: string } }>({
      method: method,
      url: submitUrl,
      data: dataObj,
    });
    devLog("simpleSubmit response:", response);
    message.success("Cập nhật thành công", 1);
    onSuccess?.();
  } catch (error) {
    devLog(error);
    message.error(`Cập nhật thất bại. ${getErrorMessage(error)}`);
  }
};

export function getErrorMessage(error: unknown) {
  let errorMsg = "";
  if (error instanceof AxiosError) {
    switch (error.status) {
      case 400: {
        errorMsg = "Dữ liệu không hợp lệ";
        break;
      }
      case 500: {
        errorMsg = "Lỗi hệ thống";
        break;
      }
      default:
        errorMsg = "Lỗi yêu cầu";
    }
  } else {
    errorMsg = "Lỗi không xác định";
  }
  return errorMsg;
}

export function FormOfCollection(
  props: Omit<ModalFormProps, "submitFn"> & {
    collectionName: string;
    submitFn?: (values: unknown) => void;
  }
) {
  const { collectionName, formControls, fileFields } = props;
  const queryClient = useQueryClient();
  const initialValues = useModalForm((s) => s.formValues);
  /**
   * depends on: formControls, initialValues, collectionName
   * @param data form data
   * @returns Promise<void>
   */
  const submitFn =
    props.submitFn ??
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
        if (typeof files === "object" && files) {
          const safeFiles = files as Record<
            string,
            { file: File; fileList: UploadFile[] }
          >;
          const itemId = text._id ?? response.data.result._id;
          const fileURLs = await upload({
            files: safeFiles,
            fields: fileFields,
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
        message.success("Cập nhật thành công", 1);
        queryClient.invalidateQueries({
          queryKey: [`get_${collectionName}`],
        });
      } catch (error) {
        devLog(error);
        message.error(`Cập nhật thất bại, ${getErrorMessage(error)}`);
      }
    });
  return <ModalForm {...props} submitFn={submitFn} />;
}
