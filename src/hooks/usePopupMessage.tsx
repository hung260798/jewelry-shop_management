import { message } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { createContext, useContext } from "react";

type PopupContextProviderProps = {
  children: React.ReactNode;
};

const PopupContext = createContext<
  null | [MessageInstance, React.ReactElement, string]
>(null);

export const PopupContextProvider: React.FC<PopupContextProviderProps> = ({
  children,
}: PopupContextProviderProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const key = "updatable-msg";
  return (
    <PopupContext.Provider value={[messageApi, contextHolder, key]}>
      {children}
    </PopupContext.Provider>
  );
};

export default function usePopupMessage() {
  return useContext(PopupContext);
}
