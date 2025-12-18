import { useChat } from "@/hooks/useChat";
import { useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "utils/constants/URLS";
import UserBox from "../UserBox/UserBox";

interface UserListProps {
  items: any;
}

const UserList: React.FC<UserListProps> = ({ items }) => {
  const { getConversation } = useChat((state: any) => state);

  const [selectedConversationId, setSelectedConversationId] = useState("");

  const socket = useRef<any>();
  socket.current = io(API_URL);

  // useEffect(() => {
  //   socket.current?.on("server-message", (data: any) => {
  //     console.log("««««« data »»»»»", data);
  //   });
  // }, []);
  return (
    <aside className="lg:pb-0 lg:w-70 lg:block border-gray-200">
      <div className="">
        <div className="flex-col">
          <div className="text-2xl font-bold text-neutral-800 py-4">People</div>
        </div>
        {items.map((item: any) => {
          const handleClick = (item: any) => {
            setSelectedConversationId(item.conversationId);
            getConversation(item);

            // join room
            const data = {
              room: item.conversationId,
            };
            socket?.current?.emit("client-message", data);
          };

          return (
            <UserBox
              key={item._id}
              data={item}
              selected={selectedConversationId}
              onClick={handleClick}
            />
          );
        })}
      </div>
    </aside>
  );
};

export default UserList;
