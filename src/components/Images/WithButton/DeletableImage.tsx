import { usePreviewLayer } from "@/components/Images/PreviewLayer";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { ComponentPropsWithoutRef } from "react";
import styles from "./style.module.css";

type Props = ComponentPropsWithoutRef<"div"> & {
  onDelete: () => void;
  listSrc?: string[];
  currentIndex?: number;
  width: number;
  height: number;
  src: string;
};

export const DeletableImage: React.FC<Props> = ({
  onDelete,
  listSrc,
  currentIndex,
  width = 120,
  height = 120,
  ...props
}: Props) => {
  const setPreviewSrc = usePreviewLayer((s) => s.setSrc);
  const setCurrentIndex = usePreviewLayer((s) => s.setCurrentIndex);

  return (
    <div className={`relative w-[${width}px] h-[${height}px] ${styles.root} `}>
      <img
        loading="lazy"
        {...props}
        className={`min-h-[100px] object-cover`}
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.src = "/placeholder-image.jpg"; // Replace with your fallback image path
        }}
      />
      <div
        className={`absolute inset-0 bg-gray-600 flex justify-center items-center ${styles.mask}`}
      >
        <div className="opacity-100">
          <Button
            icon={<EyeOutlined className={styles.bttn} />}
            onClick={() => {
              setPreviewSrc(listSrc ?? props.src ?? []);
              setCurrentIndex(currentIndex ?? -1);
            }}
            type="text"
          />
          <Button
            icon={<DeleteOutlined className={styles.bttn} />}
            type="text"
            style={{ marginLeft: ".3rem" }}
            onClick={() => {
              Modal.confirm({
                okText: "Xóa",
                cancelText: "Hủy",
                title: "Xóa ảnh?",
                onOk: () => onDelete(),
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
