import { usePreview } from "hooks/usePreview";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { ImageProps, Button, Popconfirm } from "antd";
import LazyFadeImage from "components/images/Lazy/";
import styles from "./style.module.css";

type Props = ImageProps & {
  onDelete?: () => void;
};

export const DeletableImage: React.FC<Props> = ({
  preview = false,
  onDelete,
  ...props
}: Props) => {
  const setPreviewSrc = usePreview((s) => s.setSrc);
  const handleView = () => {
    setPreviewSrc(props.src);
  };
  const handleDelete = () => {
    onDelete?.();
  };
  return (
    <div className={`relative w-[100px] h-[100px] ${styles.root}`}>
      <LazyFadeImage preview={preview} {...props} />
      <div
        className={`absolute inset-0 bg-gray-600 flex justify-center items-center ${styles.mask}`}
      >
        <div className="opacity-100">
          <Button
            icon={
              <EyeOutlined
                color="white"
                className="text-white font-bold"
                style={{ fontSize: "20px" }}
              />
            }
            onClick={() => handleView()}
            type="text"
          />
          {onDelete && (
            <Popconfirm title="Xóa ảnh này?" onConfirm={() => handleDelete()}>
              <Button
                icon={
                  <DeleteOutlined
                    className="text-white font-bold"
                    style={{ fontSize: "20px" }}
                  />
                }
                type="text"
              />
            </Popconfirm>
          )}
        </div>
      </div>
    </div>
  );
};
