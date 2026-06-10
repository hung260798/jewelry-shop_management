import { Image } from "antd";
import { ImageProps } from "antd/es/image";
import { useState } from "react";
import style from "./style.module.css";

const LazyFadeImage: React.FC<ImageProps> = ({
  className,
  fallback,
  preview = false,
  ...props
}: ImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      alt="Ảnh"
      loading="lazy"
      preview={preview}
      className={`${loaded ? style.fadeIn : style.hidden} ${
        style.fallbackTransition
      } ${className} object-cover`}
      onLoad={() => setLoaded(true)}
      fallback={fallback || "/placeholder-image.jpg"}
      {...props}
    />
  );
};

export default LazyFadeImage;
