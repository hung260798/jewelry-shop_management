import { FormItemProps } from "antd";
import { ReactNode } from "react";

export type SubmitData = { _id?: string } & Record<string, unknown>;

export type FormProps = {
  formValues: unknown;
  submitFn?: (values: unknown) => Promise<void>;
  formControls: FormControl[];
  title: string;
  refetch?: () => void | Promise<void>;
  collectionName?: string;
  fileFields?: FileField[];
};

export interface FormControl {
  name?: string | string[];
  label: string;
  component: ReactNode;
  valuePropName?: string;
  className?: string;
  rules?:
    | FormItemProps["rules"]
    | Record<"add" | "update", FormItemProps["rules"]>;
  flex?: string;
  getValueProps?: (value: any) => Record<string, unknown>;
  getValueFromEvent?: (...args: any[]) => any;
  onSubmit?: (v: any) => any;
  normalize?: FormItemProps["normalize"];
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
  sizes?: [number, number][];
}
