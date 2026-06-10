import { useUser } from "@/hooks/stores/useAuthStore";
import { API_URL } from "@/utils/constants/URLS";
import { UserOutlined } from "@ant-design/icons";
import { Button, Divider, List, Skeleton } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

type DataAttemp = {
  firstName: string;
  lastName: string;
  email: string;
};

type ConverAttemp = {
  members: string[];
};

const Conversation = ({ conver }: { conver: ConverAttemp[] }) => {
  const authUser = useUser();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataAttemp[]>([]);

  useEffect(() => {
    const friendId = conver.flatMap((object) =>
      object.members.filter((memberId) => memberId !== authUser?._id)
    );
    const query = friendId
      .map((employeeId: string) => `employeeId=${employeeId}`)
      .join("&");
    console.log("««««« query »»»»»", query);
    const getUser = async () => {
      const res = await axios.get(`${API_URL}?${query}`);
      console.log("««««« res.data »»»»»", res.data);
      setData(res.data.results);
    };
    getUser();
  }, [authUser, conver]);

  const loadMoreData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
  };

  return (
    <div
      id="scrollableDiv"
      style={{
        height: 400,
        overflow: "auto",
        padding: "0 16px",
        border: "1px solid rgba(140, 140, 140, 0.35)",
      }}
    >
      <InfiniteScroll
        dataLength={data.length}
        next={loadMoreData}
        hasMore={data.length < 50}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item key={item.email}>
              <Button
                className="text-start"
                style={{ width: "250px", height: "auto" }}
              >
                <List.Item.Meta
                  // avatar={<Avatar src={item.picture.large} />}
                  avatar={<UserOutlined />}
                  title={
                    <div>
                      {" "}
                      {item.firstName}
                      <span> </span>
                      {item.lastName}
                    </div>
                  }
                  description={item.email}
                />
              </Button>
            </List.Item>
          )}
        />
      </InfiniteScroll>
    </div>
  );
};

export default Conversation;
