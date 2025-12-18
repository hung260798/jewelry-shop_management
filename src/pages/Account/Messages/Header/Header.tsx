"use client";

import { useChat } from "@/hooks/useChat";
import { appendDomain } from "@/utils/stringUtils";
import { Avatar } from "antd";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { ASSET_URL } from "utils/constants/URLS";

const Header: React.FC<any> = () => {
  const { conversationData } = useChat((state) => state);

  return (
    <div
      className="
        bg-white
        w-full
        flex
        border-b-[1px]
        sm:px-4
        py-3
        px-4
        lg:px-6
        justify-between
        items-center
        shadow-sm
      "
    >
      <div className="flex gap-3 items-center">
        <Link
          to="/messages"
          className="
            lg:hidden
            block
            text-sky-500
            hover:text-sky-600
            transition
            cursor-pointer
          "
        ></Link>
        <Avatar
          size={40}
          src={appendDomain(
            conversationData?.employeeInfo?.imageUrl || "",
            ASSET_URL
          )}
        />

        <div className="flex flex-col">
          <div>
            {conversationData?.employeeInfo?.firstName}{" "}
            {conversationData?.employeeInfo?.lastName}
          </div>
          <div className="text-sm font-light text-neutral-500">
            Don&apos;t know
          </div>
        </div>
      </div>
      <HiEllipsisHorizontal
        size={32}
        // onClick={() => setDrawerOpen(true)}
        className="
          text-sky-500
          cursor-pointer
          hover:text-sky-600
          transition
        "
      />
    </div>
  );
};

export default Header;
