import { useForm } from "react-hook-form";
import { HiPaperAirplane } from "react-icons/hi2";
import MessageInput from "./MessageInput";
import { io } from "socket.io-client";
import { useRef } from "react";
import { API_URL } from "utils/constants/URLS";
import { useChat } from "hooks/useChat";
import { useAuthStore } from "hooks/useAuthStore";
const Form = () => {
  const socket = useRef<any>();
  socket.current = io(API_URL);
  // socket.current?.on("direct-message", (data: any) => {
  //   console.log("Received direct message:", data);
  // });
  const { conversationData } = useChat((state) => state);
  const { auth } = useAuthStore((state) => state);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit: any = (data: any) => {
    setValue("message", "", { shouldValidate: true });
    const { message } = data;
    socket.current.emit("client-message", {
      employee: {
        _id: auth?.user?._id,
        firstName: auth?.user?.firstName,
        lastName: auth?.user?.lastName,
        imageUrl: auth?.user?.imageUrl,
      },
      type: "chat",
      text: message,
      sender: auth?.user?._id,
      conversationId: conversationData?.conversationId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };
  return (
    <div
      className="
        py-4
        px-4
        bg-white
        border-t
        flex
        items-center
        gap-2
        lg:gap-4
        w-full
      "
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2 lg:gap-4 w-full"
      >
        <MessageInput
          id="message"
          register={register}
          errors={errors}
          required
          placeholder="Write a message"
        />
        <button
          type="submit"
          className="
            rounded-full
            p-2
            bg-sky-500
            cursor-pointer
            hover:bg-sky-600
            transition
          "
        >
          <HiPaperAirplane size={18} className="text-white" />
        </button>
      </form>
    </div>
  );
};

export default Form;
