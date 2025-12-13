import { Card, Col, Row } from "antd";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../hooks/useAuthStore";
import { axiosClientJson } from "../../../libraries/axiosClient";
import UserList from "../UserList/UserList";
import Body from "./Body/Body";
import Form from "./Form/Form";
import Header from "./Header/Header";

const MessagesDev = () => {
  const [conversations, setConversations] = useState([]);
  const { auth } = useAuthStore((state) => state);

  useEffect(() => {
    if (auth) {
      const getConversations = async () => {
        try {
          const res = await axiosClientJson.post(
            `/conversations/${auth.user._id}`
          );
          setConversations(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      getConversations();
    }
  }, [auth]);

  return (
    <Row
      className="px-2 py-2  bg-body-secondary rounded-5 d-flex justify-content-evenly"
      style={{ backgroundColor: "white" }}
    >
      <Col xs={24} xl={6}>
        <Card variant="outlined" style={{ width: "100%" }}>
          <UserList items={conversations} />
        </Card>
      </Col>
      <Col xs={24} xl={18} title="Box chat">
        <Card variant="outlined">
          <Header
            conversation={{
              users: undefined,
            }}
          />
          <Body />
          <Form />
        </Card>
      </Col>
    </Row>
  );
};

export default MessagesDev;
