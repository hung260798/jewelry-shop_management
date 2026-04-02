import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { message } from "antd";
import { User as Employee } from "@/utils/types/Entities";

interface SliceType {
  conversationData?: {
    conversationId: string;
    members: Array<string>;
    employeeInfo?: Employee;
  };
  getConversation: (data?: unknown) => Promise<void>;
}
export const useChat = create<SliceType>()(
  devtools((set) => {
    return {
      conversationData: undefined,
      getConversation: async (data) => {
        try {
          set(
            { conversationData: data as SliceType["conversationData"] },
            false,
            { type: "get/Conversation" }
          );
        } catch {
          // set({ auth: null }, false, { type: "auth/login-error" });
          // throw new Error("Login failed");
          throw message.error("Account's not found", 1.5);
        }
      },
    };
  })
);
