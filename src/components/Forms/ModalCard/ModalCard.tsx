import { useScreen } from "@/hooks/useWidth";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Empty, Modal, ModalProps, Spin, Tag } from "antd";
import _ from "lodash";
import { useEffect } from "react";
import useModalCard from "./useModalCard";

type ModalCardProps = {
  cardControls: CardControl[];
  title?: string;
  modalProps?: ModalProps;
  collectionName: string;
  loading?: boolean;
};

export type CardControl = {
  label: string;
  name: string | string[];
  component?: React.ReactNode;
  render?: (value: unknown) => React.ReactNode;
};

/**
 * Read-only modal card component for displaying database record information
 * Similar to ModalForm but without editing capabilities
 * Uses the same modal state management via useModalForm hook
 */
export const ModalCard = ({
  cardControls,
  title = "Card",
  modalProps = {},
  loading = false,
}: ModalCardProps) => {
  const breakpoint = 768;
  const isSmallScreen = useScreen(breakpoint);
  const { cardValues, open, closeModal } = useModalCard((s) => s);
  const sharedModalProps: ModalProps = {
    onCancel: closeModal,
    open,
    title: <span className="text-base font-semibold text-slate-900">{title}</span>,
    width: isSmallScreen ? "calc(100vw - 24px)" : 900,
    footer: null,
    centered: true,
    styles: {
      body: {
        maxHeight: isSmallScreen ? "calc(100vh - 160px)" : "72vh",
        overflowY: "auto",
        padding: 0,
      },
    },
    ...modalProps,
  };

  useEffect(() => {
    return () => {
      closeModal();
    };
  }, [closeModal]);

  /**
   * Helper function to render any value based on its type
   */
  const renderValueByType = (val: unknown): React.ReactNode => {
    if (val == null) {
      return <span className="text-slate-400">N/A</span>;
    }

    // String values
    if (typeof val === "string") {
      const trimmedValue = val.trim();

      if (!trimmedValue) {
        return <span className="text-slate-400">Empty</span>;
      }

      // Check if it's a URL/image
      if (
        trimmedValue.startsWith("http://") ||
        trimmedValue.startsWith("https://") ||
        trimmedValue.startsWith("data:image")
      ) {
        if (
          trimmedValue.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) ||
          trimmedValue.startsWith("data:image")
        ) {
          return (
            <div className="flex items-center">
              <img
                src={trimmedValue}
                alt="preview"
                className="max-h-40 max-w-full rounded-md border border-slate-200 object-contain shadow-sm"
              />
            </div>
          );
        } else {
          return (
            <div className="flex min-w-0 items-center gap-2">
              <LinkOutlined className="shrink-0 text-blue-500" />
              <a
                href={trimmedValue}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 break-all font-medium text-blue-600 hover:text-blue-700"
              >
                {trimmedValue}
              </a>
            </div>
          );
        }
      }
      return <span className="whitespace-pre-wrap break-words">{trimmedValue}</span>;
    }

    // Number values
    if (typeof val === "number") {
      return <span className="font-medium tabular-nums">{val.toLocaleString()}</span>;
    }

    // Boolean values
    if (typeof val === "boolean") {
      return (
        <Tag
          icon={val ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={val ? "success" : "error"}
          className="m-0"
        >
          {val ? "Yes" : "No"}
        </Tag>
      );
    }

    // Array values - render each item according to its type
    if (Array.isArray(val)) {
      if (val.length === 0) {
        return <span className="text-slate-400">Empty</span>;
      }
      return (
        <div className="flex flex-col gap-2">
          {val.map((item, idx) => (
            <div
              key={idx}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {renderValueByType(item)}
            </div>
          ))}
        </div>
      );
    }

    // Object values
    if (typeof val === "object") {
      return (
        <pre className="m-0 max-h-52 overflow-auto rounded-md border border-slate-200 bg-slate-950 p-3 text-xs leading-5 text-slate-100">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }

    // Fallback
    return <span>{String(val)}</span>;
  };

  /**
   * Format value for display based on its type
   */
  const renderValue = (control: CardControl) => {
    if (!cardValues || !control.name)
      return <span className="text-slate-400">N/A</span>;

    const value = _.get(cardValues, control.name);
    return renderValueByType(value);
  };

  if (!cardValues) {
    return (
      <Modal {...sharedModalProps}>
        <div className="px-6 py-10">
          <Empty description="No data to display" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal {...sharedModalProps}>
      <Spin spinning={loading}>
        <div className="bg-slate-50 px-4 py-4 sm:px-6">
          {cardControls.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-white px-6 py-10">
              <Empty description="No fields to display" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              {cardControls.map((control, index) => {
                return (
                  <div
                    key={index}
                    className="grid gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4 sm:px-5"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:pt-1">
                      {control.label}
                    </div>
                    <div className="min-w-0 text-sm leading-6 text-slate-900">
                      {control.render
                        ? control.render(_.get(cardValues, control.name))
                        : renderValue(control)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Spin>
    </Modal>
  );
};
