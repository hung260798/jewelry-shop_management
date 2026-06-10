import { useScreen } from "@/hooks/useWidth";
import { Empty, Modal, ModalProps, Spin } from "antd";
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
      return <span className="text-gray-400">N/A</span>;
    }

    // String values
    if (typeof val === "string") {
      // Check if it's a URL/image
      if (
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("data:image")
      ) {
        if (
          val.endsWith(".jpg") ||
          val.endsWith(".jpeg") ||
          val.endsWith(".png") ||
          val.endsWith(".gif")
        ) {
          return (
            <div className="flex items-center gap-2">
              <img
                src={val}
                alt="preview"
                className="max-w-xs max-h-32 rounded"
              />
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-2">
              <a href={val} target="_blank" rel="noopener noreferrer">
                {val}
              </a>
            </div>
          );
        }
      }
      return <span>{val}</span>;
    }

    // Number values
    if (typeof val === "number") {
      return <span>{val.toLocaleString()}</span>;
    }

    // Boolean values
    if (typeof val === "boolean") {
      return (
        <span
          className={
            val ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
          }
        >
          {val ? "Yes" : "No"}
        </span>
      );
    }

    // Array values - render each item according to its type
    if (Array.isArray(val)) {
      if (val.length === 0) {
        return <span className="text-gray-400">Empty</span>;
      }
      return (
        <div className="space-y-1">
          {val.map((item, idx) => (
            <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
              {renderValueByType(item)}
            </div>
          ))}
        </div>
      );
    }

    // Object values
    if (typeof val === "object") {
      return (
        <div className="text-sm bg-gray-50 p-2 rounded font-mono overflow-auto max-h-40">
          {JSON.stringify(val, null, 2)}
        </div>
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
      return <span className="text-gray-400">N/A</span>;

    const value = _.get(cardValues, control.name);
    return renderValueByType(value);
  };

  if (!cardValues) {
    return (
      <Modal
        onCancel={closeModal}
        open={open}
        title={title}
        width={isSmallScreen ? "100%" : "1000px"}
        footer={null}
        {...modalProps}
      >
        <Empty description="No data to display" />
      </Modal>
    );
  }

  return (
    <Modal
      onCancel={closeModal}
      open={open}
      title={title}
      width={isSmallScreen ? "100%" : "1000px"}
      footer={null}
      {...modalProps}
    >
      <Spin spinning={loading}>
        <div className="px-6 pt-2 pb-4">
          {cardControls.length === 0 ? (
            <Empty description="No fields to display" />
          ) : (
            <div className="space-y-4">
              {cardControls.map((control, index) => {
                const css = isSmallScreen ? { marginBottom: ".35rem" } : {};
                return (
                  <div key={index} style={css}>
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      {control.label}
                    </div>
                    <div className="text-sm text-gray-900 pl-4 border-l-2 border-blue-300">
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
