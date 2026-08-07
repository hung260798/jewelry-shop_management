import { FormItemProps } from "antd";
import { ReactNode } from "react";

export type SubmitData = { _id?: string } & Record<string, unknown>;

export type FormProps = {
  formValues: unknown;
  submitFn?: (values: unknown) => Promise<void>;
  formControls: FormControl[];
  modalTitle: string | ((formValues: unknown) => string);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch?: () => any | Promise<any>;
  collectionName?: string;
  fileFields?: FileField[];
};

type PickFormItemProps =
  | "getValueProps"
  | "getValueFromEvent"
  | "normalize"
  | "valuePropName";

export interface FormControl extends Pick<FormItemProps, PickFormItemProps> {
  name?: string | string[];
  label: string;
  component: ReactNode | React.FC<unknown>;
  className?: string;
  rules?:
    | FormItemProps["rules"]
    | Record<"add" | "update", FormItemProps["rules"]>;
  flex?: string;
  defaultValue?: unknown;
  method?: "post" | "patch";
}

export interface FileField {
  /**
   * Name of the file field in form
   */
  name: string;
  /**
   * Maximum number of files allowed for this field (default is 1)
   */
  maxCount?: number;
  /**
   * Label for the file field (default is the name)
   */
  label?: string;
  /**
   * file's type
   */
  fileType?: string;
  /**
   * Optional array of allowed file sizes in bytes (e.g., [1048576] for 1MB)
   */
  sizes?: [number, number][];
}
