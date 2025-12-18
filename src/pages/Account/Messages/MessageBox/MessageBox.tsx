import { appendDomain } from "@/utils/stringUtils";
import { Avatar } from "antd";
import clsx from "clsx";
import { useAuthStore } from "hooks/useAuthStore";
import { format } from "timeago.js";
import { ASSET_URL } from "utils/constants/URLS";
import { Message } from "utils/types/Entities";

const MessageBox: React.FC<PropTypes> = ({ data }: PropTypes) => {
  // const [imageModalOpen, setImageModalOpen] = useState(false);

  const { auth } = useAuthStore((state) => state);
  const isOwn = data.sender === auth?.user?._id;

  const containerClass = clsx("flex gap-3 p-4", isOwn && "justify-end");
  const avatarClass = clsx(isOwn && "order-2");
  const bodyClass = clsx("flex flex-col gap-2", isOwn && "items-end");
  const messageClass = clsx(
    "text-sm  w-fit rounded-lg  py-2 px-3 max-w-xs",
    isOwn ? "bg-sky-500 text-white" : "bg-gray-100",
    // data?.employeeInfo?.imageUrl ? "rounded-md p-0" : "rounded-full py-2 px-3",
    "whitespace-normal break-words" // Apply the Tailwind CSS classes to wrap the text
  );

  return (
    <div className={containerClass}>
      <div className={avatarClass}>
        <Avatar
          size={40}
          src={appendDomain(
            (isOwn ? auth.user?.imageUrl : data.receiver.imageUrl) || "",
            ASSET_URL
          )}
        />
      </div>
      <div className={bodyClass}>
        <div className="flex items-center gap-1">
          <div className="text-sm text-gray-500">
            {data?.receiver?.lastName}
          </div>
          <div className="text-xs text-gray-400">
            {format(new Date(data?.createdAt), "p")}
          </div>
        </div>

        <div className={messageClass}>
          <p className="text-clip overflow-hidden ">{data.text}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;

interface PropTypes {
  setAmountSkip: (f: (prev: number) => number) => void;
  isLast: boolean;
  data: Message;
}
