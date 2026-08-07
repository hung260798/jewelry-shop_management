import { useQueryClient } from "@tanstack/react-query";
import { Form, Grid, Modal, ModalProps } from "antd";
import _ from "lodash";
import { useEffect, useRef } from "react";

import { axiosClientJson } from "@/libraries/axiosClient";
import { devLog, getErrorMessage } from "@/utils/logger";
import { FormProps } from "@/utils/types/Form";

import usePopupMessage from "@/hooks/usePopupMessage";
import { GetMany, IdWise } from "@/utils/types/Entities";
import style from "./style.module.css";
import { useModalForm } from "./useModalForm";

export type ModalFormProps = Omit<FormProps, "formValues"> & {
  modalProps?: ModalProps;
};

export const ModalForm = ({
  submitFn,
  formControls,
  modalTitle,
  modalProps = {},
  collectionName,
  // fileFields,
}: ModalFormProps) => {
  const [form] = Form.useForm();
  const screens = Grid.useBreakpoint();
  const [messageApi] = usePopupMessage() ?? [];
  const { formValues, open, closeModal, formKey, queryKey } = useModalForm(
    (state) => state
  );
  // const [searchParams] = useSearchParams();
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
    if (typeof values !== "object" || values == null || !collectionName) {
      closeModalAndCleanUp();
      return messageApi?.error("Dữ liệu không hợp lệ");
    }
    const lodash = await import("lodash");
    const formValuesClone = _.clone(formValues);
    const openClone = open;
    const formKeyClone = formKey;
    const queryKeyClone = _.clone(queryKey);
    const data = lodash.clone(values);
    const fieldsChangedClone = _.clone(fieldsChanged);

    messageApi?.open({
      key: "submit",
      content: "Đang cập nhật",
      type: "loading",
    });
    if (submitFn) {
      closeModalAndCleanUp();
      try {
        await submitFn(data);
        messageApi?.open({
          key: "submit",
          content: "Cập nhật thành công",
          type: "success",
          duration: 1,
        });
      } catch (error) {
        devLog(error);
        messageApi?.open({
          key: "submit",
          content: `Cập nhật thất bại, ${getErrorMessage(error)}`,
          type: "error",
          duration: 1,
        });
      }
      return;
    }
    closeModalAndCleanUp();
    const method = formValuesClone ? "patch" : "post";
    const previousCache = queryClient.getQueryData(queryKeyClone);
    try {
      // **** Optimistic Update for patch request ****
      if (method === "patch") {
        queryClient.setQueryData(
          queryKeyClone,
          (oldData: GetMany<IdWise> | undefined) => {
            if (oldData == null) {
              return;
            }
            const shallowClone = oldData.results.map((e) => {
              if (e._id !== (data as IdWise)._id) return e;
              return { ...e, ...(data as IdWise) };
            });

            return { ...oldData, results: shallowClone };
          }
        );
      }
      const json = _.omit(data, "files") as IdWise;
      const submitUrl = `/${collectionName}${formValuesClone ? `/${json._id}` : ""}`;
      const response = await axiosClientJson<{
        result: IdWise;
      }>({
        method: method,
        url: submitUrl,
        data: method === "post" ? json : fieldsChangedClone.current,
      });

      messageApi?.open({
        key: "submit",
        content: "Cập nhật thành công",
        type: "success",
        duration: 1,
      });
      if (method === "post") {
        queryClient.invalidateQueries({
          queryKey: [`${collectionName}`],
        });
      }
    } catch (error) {
      devLog(error);
      messageApi?.open({
        key: "submit",
        content: `Cập nhật thất bại, ${getErrorMessage(error)}`,
        type: "error",
        duration: 1,
      });
      queryClient.setQueryData(queryKeyClone, previousCache);
    } finally {
      // queryClient.invalidateQueries({ queryKey: [`${collectionName}`] });
    }
  };

  const {
    width,
    rootClassName,
    okButtonProps,
    cancelButtonProps,
    ...restModalProps
  } = modalProps;
  const rootClassNames = [style.modalFormModal, rootClassName]
    .filter(Boolean)
    .join(" ");

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
      title={
        <div className={style.modalTitle}>
          <span>
            {typeof modalTitle === "function"
              ? modalTitle(formValues)
              : modalTitle}
          </span>
          <span className={style.modeBadge}>
            {formValues ? "Cập nhật" : "Tạo mới"}
          </span>
        </div>
      }
      width={screens.md ? (width ?? 840) : "calc(100vw - 24px)"}
      centered
      rootClassName={rootClassNames}
      okButtonProps={{ size: "large", ...okButtonProps }}
      cancelButtonProps={{ size: "large", ...cancelButtonProps }}
      modalRender={(dom) => (
        <Form
          form={form}
          layout={screens.md ? "horizontal" : "vertical"}
          requiredMark={false}
          onValuesChange={(changedValues) => {
            fieldsChanged.current = {
              ...fieldsChanged.current,
              ...changedValues,
            };
          }}
          onFinish={handleSubmit}
          onFinishFailed={(err) => {
            messageApi?.error("Lỗi submit");
            devLog(err);
          }}
        >
          {dom}
        </Form>
      )}
      {...restModalProps}
    >
      <div className={style.formBody}>
        {formControls.map((item, index) => {
          const {
            component,
            valuePropName = "value",
            name,
            label,
            className = "",
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
          return (
            <Form.Item
              key={index}
              valuePropName={valuePropName}
              name={name}
              label={label}
              labelCol={{ span: screens.md ? 7 : 24 }}
              wrapperCol={{ span: screens.md ? 17 : 24 }}
              className={className + " " + style.formItem}
              getValueProps={getValueProps}
              getValueFromEvent={getValueFromEvent}
              normalize={normalize}
              rules={item.rules}
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
