import { usePreviewLayer } from "@/components/Images/PreviewLayer";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Modal, Skeleton } from "antd";
import { ComponentPropsWithoutRef, ReactNode, useState } from "react";
import styles from "./DeletableImage.module.css";

type Props = ComponentPropsWithoutRef<"img"> & {
  /**Callback để xoá ảnh */
  onDelete: () => void;
  /**
   * Danh sách nguồn ảnh đi kèm để navigation tới lui
   */
  listSrc?: string[];
  /**Thứ tự của ảnh này trong danh sách */
  currentIndex?: number;
  width: number;
  height: number;
  src: string;
  badge?: ReactNode;
};

/**
 * Ảnh có nút phóng to và nút xoá, thao tác xoá tự định nghĩa
 */
export const DeletableImage: React.FC<Props> = ({
  onDelete,
  listSrc,
  currentIndex,
  width = 120,
  height = 120,
  badge,
  ...props
}: Props) => {
  const setPreviewSrc = usePreviewLayer((s) => s.setSrc);
  const setCurrentIndex = usePreviewLayer((s) => s.setCurrentIndex);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative shadow-md shadow-violet-200 ${styles.root}`}
      style={{
        width,
        height,
        border: hasError ? "1px solid #ef4444" : undefined,
      }}
      title="DeletableImage"
    >
      <span className="absolute top-1 right-1">{badge}</span>
      <div>
        <img
          loading="lazy"
          className={`h-full w-full object-cover ${hasError ? "opacity-80" : ""}`}
          style={{ width, height }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = "/placeholder-image.jpg";
            setHasError(true);
          }}
          {...props}
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
              onClick={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
