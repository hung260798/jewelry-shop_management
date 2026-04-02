import { usePreviewLayer } from "@/hooks/stores/usePreviewLayer";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { ImageProps, Button, Popconfirm } from "antd";
import styles from "./style.module.css";

type Props = ImageProps & {
  onDelete?: () => void;
  listSrc?: string[];
  currentIndex?: number;
};

export const DeletableImage: React.FC<Props> = ({
  onDelete,
  listSrc,
  currentIndex,
  ...props
}: Props) => {
  const setPreviewSrc = usePreviewLayer((s) => s.setSrc);
  const setCurrentIndex = usePreviewLayer((s) => s.setCurrentIndex);
  const width = props.width || 120;
  const height = props.height || 120;

  return (
    <div className={`relative w-[${width}px] h-[${height}px] ${styles.root}`}>
      {/* <LazyFadeImage preview={preview} {...props} /> */}
      <img loading="lazy" {...props} />
      <div
        className={`absolute inset-0 bg-gray-600 flex justify-center items-center ${styles.mask}`}>
        <div className="opacity-100">
          <Button
            icon={
              <EyeOutlined
                className="text-blue font-bold"
                style={{ fontSize: "20px" }}
              />
            }
            onClick={() => {
              setPreviewSrc(listSrc ?? props.src);
              setCurrentIndex(currentIndex);
            }}
            type="default"
          />
          {onDelete && (
            <Popconfirm
              title="Xóa ảnh này?"
              onConfirm={() => {
                onDelete?.();
              }}>
              <Button
                icon={
                  <DeleteOutlined
                    className="text-red font-bold"
                    style={{ fontSize: "20px" }}
                  />
                }
                type="default"
                style={{ marginLeft: ".3rem" }}
              />
            </Popconfirm>
          )}
        </div>
      </div>
    </div>
  );
};
