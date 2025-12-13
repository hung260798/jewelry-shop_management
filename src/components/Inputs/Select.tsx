import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import { AxiosResponse } from "axios";
import { useState } from "react";

export interface DataSelectProps<T = unknown> {
  options?: T[];
  value?: string;
  onChange?: (value: string) => void;
  queryOpts: {
    queryFn: () => Promise<AxiosResponse>;
    queryKey: unknown[];
  };
}

export const DataSelect = (props: DataSelectProps) => {
  const { data: response, isLoading, error } = useQuery(props.queryOpts);
  const options = response?.data.results;
  const [value, setValue] = useState<string | null>(null);
  // devLog("categories input controls", categories);
  if (isLoading) {
    return <>Loading...</>;
  }
  if (error) {
    return <>Load error</>;
  }
  if (!Array.isArray(options)) {
    return <>Null</>;
  }
  return (
    <Select<string, { label: string; value: string }>
      showSearch
      placeholder="Select an option"
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      options={options.map((item) => {
        return {
          label: item.name,
          value: item._id,
        };
      })}
      value={props.value ?? value}
      onChange={(value) => {
        setValue(value);
        props.onChange?.(value);
      }}
    />
  );
};
