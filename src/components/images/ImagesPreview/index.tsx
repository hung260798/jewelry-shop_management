import { usePreview } from "@/hooks/usePreview";
import { appendDomain } from "@/utils/stringUtils";
import { CloseOutlined } from "@ant-design/icons";
import React from "react";
import styles from "./styles.module.css";
import { ASSET_URL } from "@/utils/constants/URLS";

interface CustomDivProps extends React.HTMLAttributes<HTMLDivElement> {
  customProp?: string;
}

function CircleButton({ children, className, ...props }: CustomDivProps) {
  return (
    <div
      className={`absolute w-[40px] h-[40px] rounded-[50%] select-none ${className}`}
      {...props}
    >
      <div className="w-full h-full rounded-[50%] cursor-pointer flex justify-center items-center text-white text-xl">
        {children}
      </div>
    </div>
  );
}

export function PreviewLayer() {
  const currentSrc = usePreview((s) => s.src);
  const setCurrentSrc = usePreview((s) => s.setSrc);
  const isShowing = currentSrc !== undefined;
  if (!isShowing) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-2050 bg-[rgba(0,0,0,.45)] ${
          isShowing ? styles.show : styles.hide
        } ${styles.mask}`}
      ></div>
      <div
        className={`fixed inset-0 z-2050 flex justify-center items-center`}
        onClick={() => setCurrentSrc()}
      >
        <img
          src={appendDomain(currentSrc, ASSET_URL)}
          alt="image"
          className="max-h-[500px] transition-all "
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
        {/** Close modal button */}
        <CircleButton
          className="top-[50px] right-[50px] bg-[rgba(0,0,0,0.1)]"
          onClick={() => {
            setCurrentSrc();
          }}
        >
          <CloseOutlined />
        </CircleButton>
      </div>
    </>
  );
}
