import { useEffect, useRef, useState, useCallback } from "react";
import { Image, ImageProps } from "antd";
import cssStyles from "./style.module.css";

interface SmartImageProps extends Omit<ImageProps, "sizes"> {
  src: string;
  smallSizes?: [number, number][];
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  smallSizes = [],
  alt,
  className,
  style,
  ...props
}: SmartImageProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [attemptIndex, setAttemptIndex] = useState<number>(0);
  const failedSet = useRef<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

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
    if (!containerWidth || smallSizes.length === 0 || !src) {
      setCurrentSrc("");
      return;
    }

    const sorted = [...smallSizes].sort((a, b) => a[0] - b[0]);
    const chosen =
      sorted.find(([w]) => w >= containerWidth) || sorted[sorted.length - 1];

    const base = src.replace(/(\.[^.]+)$/i, "");
    const ext = src.match(/\.[^.]+$/i)?.[0] || "";
    const smallerUrl = `${base}_${chosen[0]}x${chosen[1]}${ext}`;

    setCurrentSrc(smallerUrl);
    setAttemptIndex(sorted.findIndex((s) => s === chosen));
  }, [containerWidth, smallSizes, src]);

  const handleError = useCallback(() => {
    const stop =
      !smallSizes.length || failedSet.current.has(currentSrc) || !src;
    if (stop) return;

    failedSet.current.add(currentSrc);
    const sorted = [...smallSizes].sort((a, b) => a[0] - b[0]);
    const nextSize = sorted[attemptIndex + 1];

    if (nextSize) {
      const base = src.replace(/(\.[^.]+)$/i, "");
      const ext = src.match(/\.[^.]+$/i)?.[0] || "";
      const nextUrl = `${base}_${nextSize[0]}x${nextSize[1]}${ext}`;
      setCurrentSrc(nextUrl);
      setAttemptIndex(attemptIndex + 1);
    } else if (currentSrc !== src) {
      setCurrentSrc("");
    }
  }, [smallSizes, attemptIndex, currentSrc, src]);

  return (
    <div ref={containerRef} className={className} style={style}>
      <Image
        loading="lazy"
        src={currentSrc}
        alt={alt}
        preview={{ src: src, destroyOnHidden: true }}
        className={`${loaded ? cssStyles.fadeIn : cssStyles.hidden} ${
          cssStyles.fallbackTransition
        } ${className} object-cover h-full w-auto`}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );
};

export default SmartImage;
