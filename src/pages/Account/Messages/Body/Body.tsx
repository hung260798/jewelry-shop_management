import React, { useEffect, useRef, useState } from "react";
import MessageBox from "../MessageBox/MessageBox";
import { useChat } from "hooks/useChat";
import { axiosClientJson } from "@/libraries/axiosClient";
import { API_URL } from "utils/constants/URLS";
import { io, Socket } from "socket.io-client";
import { Skeleton } from "antd";
import { Message, WithId } from "@/utils/types/Entities";

interface DirectMessagePayload {
  newData: WithId<Message>;
}

const Body = () => {
  const boxMessage = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true); // Flag to control automatic scrolling
  const { conversationData } = useChat((state) => state);
  const [messages, setMessages] = useState<WithId<Message>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socket = useRef<Socket>();
  socket.current = io(API_URL);

  const [amountSkip, setAmountSkip] = useState(10);

  const [loading, setLoading] = useState(false); // State to track loading state
  //BODY JOIN ROOM:
  useEffect(() => {
    // Join Room
    const data = {
      room: conversationData?.conversationId,
    };
    socket.current?.emit("client-message", data);

    const handleDirectMessage = (data: DirectMessagePayload) => {
      const { newData } = data;
      setMessages((prevMessages) => {
        if (prevMessages.some((message) => message._id === newData._id)) {
          return prevMessages; // Message already exists, no need to update state
        }
        return [...prevMessages, newData]; // Append the new message
      });
    };

    socket.current?.on("direct-message", handleDirectMessage);

    return () => {
      socket.current?.off("direct-message", handleDirectMessage);
    };
  }, [conversationData?.conversationId]);

  useEffect(() => {
    ///get Messages
    // scrollRef?.current?.scrollIntoView({ behavior: "smooth" });

    const getMessages = async () => {
      try {
        const res = await axiosClientJson.get(
          `/messages/${conversationData?.conversationId}?amountSkip=${amountSkip}`
        );
        if (res.data) {
          setMessages(() => {
            // Clear previous messages and set the new messages
            return [...res.data.messages];
          });
        }
      } catch (error) {
        console.log("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    getMessages();
  }, [amountSkip, conversationData?.conversationId]);

  useEffect(() => {
    // Scroll to the bottom when messages change, but only if autoScroll is true
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  const handleScrollToTop = () => {
    // Check if the user has scrolled to the top of the element
    if (boxMessage.current) {
      const { scrollTop } = boxMessage.current;
      if (scrollTop === 0) {
        setAmountSkip((f) => f + 10);
        setAutoScroll(false); // Disable automatic scrolling when the user scrolls to the top
        setLoading(true);
      } else {
        setAutoScroll(true); // Enable automatic scrolling when the user scrolls elsewhere
      }
    }
  };

  useEffect(() => {
    // Attach the scroll event listener when the component mounts
    boxMessage.current?.addEventListener("scroll", handleScrollToTop);

    // Clean up the event listener when the component is unmounted
    return () => {
      boxMessage?.current?.removeEventListener("scroll", handleScrollToTop);
    };
  }, []);

  useEffect(() => {
    // Attach the scroll event listener when the component mounts
    boxMessage.current?.addEventListener("scroll", handleScrollToTop);

    // Clean up the event listener when the component is unmounted
    return () => {
      boxMessage?.current?.removeEventListener("scroll", handleScrollToTop);
    };
  }, []);

  return (
    <div className="box-message">
      <div className="flex-1 overflow-y-auto max-h-96" ref={boxMessage}>
        {loading && <Skeleton active />}{" "}
        {/* Display loading message when data is being fetched */}
        {messages.map((message, i) => (
          <MessageBox
            setAmountSkip={setAmountSkip}
            isLast={i === messages.length - 1}
            key={i}
            data={message}
          />
        ))}
        <div className="pt-10" ref={scrollRef} />
      </div>
    </div>
  );
};

export default Body;
