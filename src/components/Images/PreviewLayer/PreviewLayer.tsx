import { usePreviewLayer } from "./usePreviewLayer";
import { ASSET_URL } from "@/utils/constants/URLS";
import { appendDomain } from "@/utils/stringUtils";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import React, { useEffect, useRef } from "react";
import styles from "./styles.module.css";

interface CustomDivProps extends React.HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  shape?: "circle" | "square";
}

function FloatButton({ children, className, shape, ...props }: CustomDivProps) {
  return (
    <div
      className={`absolute w-[40px] h-[40px] select-none ${shape === "circle" ? "rounded-[50%]" : "rounded-none"} ${className}`}
      {...props}>
      <Button className="bg-transparent text-white">{children}</Button>
      {/* <div
        className={`w-full h-full cursor-pointer flex justify-center items-center text-white text-xl ${shape === "circle" ? "rounded-[50%]" : "rounded-none"}`}>
        {children}
      </div> */}
    </div>
  );
}

export function PreviewLayer() {
  const srcs = usePreviewLayer((s) => s.src);
  const currentIndex = usePreviewLayer((s) => s.currentIndex);
  const setCurrentIndex = usePreviewLayer((s) => s.setCurrentIndex);
  const closeLayer = usePreviewLayer((s) => s.closeLayer);
  const ref = useRef<HTMLDivElement | null>(null);

  const isNonEmptyArray = Array.isArray(srcs) && srcs.length > 0;
  const isShowing =
    typeof srcs === "string"
      ? srcs !== ""
        ? true
        : false
      : srcs.length > 0
        ? true
        : false;

  useEffect(() => {
    if (ref.current) {
      if (!isShowing) {
        ref.current.blur();
      } else {
        ref.current.focus();
      }
    }
  }, [isShowing, ref.current]);

  const currentSrc = Array.isArray(srcs)
    ? srcs[(currentIndex ?? 0) % srcs.length]
    : srcs;

  return (
    <>
      <div
        className={`fixed inset-0 z-2050 bg-[rgba(0,0,0,.85)] ${
          isShowing ? styles.show : styles.hide
        } ${styles.mask} ${isShowing ? "block" : "hidden"}`}></div>
      <div
        className={`fixed inset-0 z-2050 flex justify-center items-center ${isShowing ? "block" : "hidden"}`}
        tabIndex={0}
        autoFocus
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Escape") {
            closeLayer();
            event.currentTarget.blur();
          } else if (event.key === "ArrowLeft" && isNonEmptyArray) {
            setCurrentIndex((n) => {
              if (n === undefined) return 0;
              return (n - 1 + srcs.length) % srcs.length;
            });
          } else if (event.key === "ArrowRight" && isNonEmptyArray) {
            setCurrentIndex((n) => {
              if (n === undefined) return 0;
              return (n + 1) % srcs.length;
            });
          }
        }}
        ref={ref}>
        <img
          src={appendDomain(currentSrc!, ASSET_URL)}
          alt="image"
          className="max-h-[500px] transition-all "
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
        {/** Close modal button */}
        <FloatButton
          shape="circle"
          className="top-[50px] right-[50px] bg-[rgba(0,0,0,0.1)]"
          onClick={() => {
            closeLayer();
          }}>
          <CloseOutlined />
        </FloatButton>
        <FloatButton
          className="absolute left-[50px] top-[50%] -translate-y-1/2 bg-[rgba(0,0,0,0.1)] text-white"
          onClick={(e) => {
            e.stopPropagation();
            if (isNonEmptyArray) {
              setCurrentIndex((n) => {
                if (n === undefined) return 0;
                return (n - 1 + srcs.length) % srcs.length;
              });
            }
          }}>
          <ArrowLeftOutlined />
        </FloatButton>
        <FloatButton
          className="absolute right-[50px] top-[50%] -translate-y-1/2 bg-[rgba(0,0,0,0.1)] text-white"
          onClick={(e) => {
            e.stopPropagation();
            if (isNonEmptyArray) {
              setCurrentIndex((n) => {
                if (n === undefined) return 0;
                return (n + 1) % srcs.length;
              });
            }
          }}>
          <ArrowRightOutlined />
        </FloatButton>
        {typeof currentIndex === "number" && Array.isArray(srcs) && (
          <span className="fixed z-10 bottom-[100px] left-1/2 -translate-x-1/2 text-white text-lg text-shadow-blue-400">
            Ảnh {currentIndex + 1} / {srcs.length}
          </span>
        )}
      </div>
    </>
  );
}
