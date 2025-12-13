import { UserOutlined } from "@ant-design/icons";
import { Avatar, Badge } from "antd";
import { useState } from "react";
import clsx from "clsx";
import { format } from "timeago.js";
import { API_URL } from "../../../utils/constants/URLS";
interface UserBoxProps {
  data: any;
  selected: any;
  onClick: (conversationId: string) => void;
}

const UserBox: React.FC<UserBoxProps> = ({ data, selected, onClick }) => {
  const handleClick = () => {
    onClick(data);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={clsx(
          "w-full relative flex items-center space-x-3 p-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer",
          selected === data.conversationId ? "bg-neutral-100" : "bg-white"
        )}
      >
        <Badge
          dot
          color="green"
        >
          <Avatar
            size={40}
            src={`${API_URL}${data?.employeeInfo?.imageUrl}`}
          />
        </Badge>
        <div className="min-w-0 flex-1">
          <div className="focus:outline-none">
            <span
              className="absolute inset-0"
              aria-hidden="true"
            />
            <div className="flex justify-between">
              <p className="text-md font-medium text-gray-900">
                {data?.employeeInfo?.firstName} {data?.employeeInfo?.lastName}
              </p>
              <p className="text-xs text-gray-400 font-light">
                {" "}
                {format(data?.lastMessage?.createdAt)}
              </p>
            </div>
            <p className="truncate text-xs">{data?.lastMessage?.text}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox;
