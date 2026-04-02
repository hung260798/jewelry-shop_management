import { Image as AntdImg, Checkbox } from "antd";

interface SelectableImageProps {
  src: string;
  alt: string;
  onChange: () => void;
  width?: number;
  height?: number;
}

const SelectableImage = ({
  src,
  alt,
  onChange,
  width,
  height,
  ...props
}: SelectableImageProps & React.ComponentProps<typeof AntdImg>) => {
  return (
    <div
      className={`relative cursor-pointer ${width ? `w-[${width}px]` : ""} ${height ? `h-[${height}px]` : ""}`}>
      <Checkbox className="absolute right-2 top-2 z-10" onChange={onChange} />
      <AntdImg src={src} alt={alt} width={width} height={height} {...props} />
    </div>
  );
};

export default SelectableImage;
