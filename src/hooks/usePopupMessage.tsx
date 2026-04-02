import { message } from "antd";
import { useEffect, useState } from "react";

type MessageOpenArgs = Parameters<typeof message.open>[0];

export default function usePopupMessage() {
  const [messageApi, contextHolder] = message.useMessage();
  const key = "updatable";
  const [showMsg, setShowMsg] = useState(false);
  const [messageOpts, setMessageOpts] = useState<MessageOpenArgs | null>(null);
  useEffect(() => {
    if (showMsg && messageOpts) {
      messageApi.open(messageOpts);
    }
  }, [showMsg, messageOpts]);

  function startLoading(content: string) {
    setShowMsg(true);
    setMessageOpts({
      key,
      content,
      type: "loading",
      duration: 0,
    });
  }

  function endLoading(content: string, type: MessageOpenArgs["type"]) {
    setMessageOpts({
      key,
      type: type,
      content,
      duration: 1,
      onClose() {
        setShowMsg(false);
      },
    });
  }

  function loadingSuccess(content: string) {
    endLoading(content, "success");
  }

  function loadingWarning(content: string) {
    endLoading(content, "warning");
  }

  function loadingError(content: string) {
    endLoading(content, "error");
  }

  return {
    messageApi,
    contextHolder,
    showMsg,
    messageOpts,
    startLoading,
    loadingSuccess,
    loadingWarning,
    loadingError,
  };
}
