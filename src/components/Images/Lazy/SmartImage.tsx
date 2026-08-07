import { Image, ImageProps } from "antd";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cssStyles from "./style.module.css";

interface SmartImageProps extends Omit<ImageProps, "sizes"> {
  src: string;
  smallSizes?: [number, number][];
  alt?: string;
  className?: string;
  style?: CSSProperties;
}

const getSizedSrc = (src: string, size?: [number, number]) => {
  if (!size) return src;

  const dotIndex = src.lastIndexOf(".");
  if (dotIndex === -1) return `${src}_${size[0]}x${size[1]}`;

  return `${src.slice(0, dotIndex)}_${size[0]}x${size[1]}${src.slice(dotIndex)}`;
};

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  smallSizes,
  alt,
  className,
  style,
  ...props
}: SmartImageProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const failedSet = useRef<Set<string>>(new Set());

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [loaded, setLoaded] = useState(false);

  const sortedSizes = useMemo(
    () => [...(smallSizes || [])].sort((a, b) => a[0] - b[0]),
    [smallSizes]
  );

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    let frame: number | null = null;
    const observer = new ResizeObserver((entries) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
    });

    observer.observe(parent);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    failedSet.current.clear();

    const chosenSize = sortedSizes.find(([width]) => width >= containerWidth);
    setCurrentSrc(getSizedSrc(src, chosenSize));
  }, [containerWidth, sortedSizes, src]);

  const handleError = useCallback(
    (e: unknown) => {
      // Không có smallSizes hoặc đã hết size
      if (!smallSizes?.length || failedSet.current.has(currentSrc)) {
        setCurrentSrc(src);
        return;
      }

      failedSet.current.add(currentSrc);
      const currentIndex = sortedSizes.findIndex(
        (size) => getSizedSrc(src, size) === currentSrc
      );
      const nextSize = sortedSizes
        .slice(currentIndex + 1)
        .find((size) => !failedSet.current.has(getSizedSrc(src, size)));

      if (nextSize) {
        setCurrentSrc(getSizedSrc(src, nextSize));
      } else {
        setCurrentSrc(src);
      }
    },
    [smallSizes, currentSrc, src]
  );

  return (
    <div ref={containerRef} className={className} style={style}>
      <Image
        loading="lazy"
        src={currentSrc}
        alt={alt}
        preview={
          currentSrc !== props.fallback
            ? { src: src, destroyOnHidden: true, mask: "Xem" }
            : false
        }
        className={`${loaded ? cssStyles.fadeIn : cssStyles.hidden} ${
          cssStyles.fallbackTransition
        } ${className} object-cover h-full`}
        onError={handleError}
        onLoad={() => {
          setLoaded(true);
        }}
        {...props}
      />
    </div>
  );
};

export default SmartImage;
