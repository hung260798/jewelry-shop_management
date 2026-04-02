import { usePreviewLayer } from "@/hooks/stores/usePreviewLayer";
import { ASSET_URL } from "@/utils/constants/URLS";
import { appendDomain } from "@/utils/stringUtils";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import React from "react";
import styles from "./styles.module.css";
import { Button } from "antd";

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
  const setSrc = usePreviewLayer((s) => s.setSrc);
  const currentIndex = usePreviewLayer((s) => s.currentIndex);
  const setCurrentIndex = usePreviewLayer((s) => s.setCurrentIndex);

  const isEmpty = !srcs || (Array.isArray(srcs) && srcs.length === 0);
  if (isEmpty) {
    return null;
  }
  const currentSrc = Array.isArray(srcs)
    ? srcs[(currentIndex ?? 0) % srcs.length]
    : srcs;

  return (
    <>
      <div
        className={`fixed inset-0 z-2050 bg-[rgba(0,0,0,.85)] ${
          isEmpty ? styles.hide : styles.show
        } ${styles.mask}`}></div>
      <div
        className={`fixed inset-0 z-2050 flex justify-center items-center`}
        onClick={() => {
          setSrc();
          setCurrentIndex();
        }}>
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
            setSrc();
            setCurrentIndex();
          }}>
          <CloseOutlined />
        </FloatButton>
        <FloatButton
          className="absolute left-[50px] top-[50%] -translate-y-1/2 bg-[rgba(0,0,0,0.1)] text-white"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((n) => {
              if (n === undefined) return 0;
              return (n - 1 + srcs.length) % srcs.length;
            });
          }}>
          <ArrowLeftOutlined />
        </FloatButton>
        <FloatButton
          className="absolute right-[50px] top-[50%] -translate-y-1/2 bg-[rgba(0,0,0,0.1)] text-white"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((n) => {
              if (n === undefined) return 0;
              return (n + 1) % srcs.length;
            });
          }}>
          <ArrowRightOutlined />
        </FloatButton>
      </div>
    </>
  );
}
