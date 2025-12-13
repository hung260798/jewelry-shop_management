import { devLog } from "@/utils/logger";
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
  const [st, setSt] = useState<State>();
  const triggerChange = (newFileList: State) => {
    onChange?.(newFileList ?? value ?? st);
  };
  return (
    <div id={id}>
      <Upload
        {...uploadProps} // Spread all Upload component props
        beforeUpload={() => false}
        onChange={(info) => {
          devLog("info", info);
          setSt({ file: info.file, fileList: info.fileList });
          triggerChange({ file: info.file, fileList: info.fileList });
        }}
        fileList={value?.fileList || st?.fileList}
        listType="text"
      >
        <Button icon={<UploadOutlined />} />
      </Upload>
    </div>
  );
};
