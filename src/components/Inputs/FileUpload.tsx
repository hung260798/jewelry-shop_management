// import { devLog } from "@/utils/logger";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Upload, UploadFile, UploadProps } from "antd";
import React, { useState } from "react";

type State = { file?: UploadFile; fileList: UploadFile[] };

export const UploadInput: React.FC<
  UploadProps & {
    id?: string;
    value?: State;
    onChange?: (value: State) => void;
  }
> = (props) => {
  const { id, value = {} as State, onChange, ...uploadProps } = props;
  const [inputState, setInputState] = useState<State>();
  const triggerChange = (newState: State) => {
    onChange?.({ ...inputState, ...value, ...newState });
  };
  return (
    <div id={id}>
      <Upload
        {...uploadProps} // Spread all Upload component props
        beforeUpload={() => false}
        onChange={({ file, fileList }) => {
          // devLog("info", info);
          setInputState({ file, fileList });
          triggerChange({ file, fileList });
        }}
        fileList={value?.fileList || inputState?.fileList}
        listType="text">
        <Button icon={<UploadOutlined />} />
      </Upload>
    </div>
  );
};
