import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Watermark,
  message,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../hooks/useAuthStore";
import { axiosClientJson } from "../../libraries/axiosClient";
import {
  CheckCircleTwoTone,
  PlusCircleOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";

//Time stamp
import { format } from "timeago.js";
// Socket;
import { io } from "socket.io-client";

const Messages: React.FC<any> = () => {
  const URL_ENV: any = API_URL || "http://localhost:9000";

  const formRef = useRef<any>(null);
  const [createForm] = Form.useForm();
  const [createConversationForm] = Form.useForm();

  //Get conversation
  const [conversations, setConversations] = useState<any>([]);
  //Create a conversation:
  const [openCreateConver, setOpenCreateConver] = useState(false);
  // const [newCoversations, setNewConversations] = useState<any>();

  //Get all User to Create conversation
  const [users, getUsers] = useState<any>([]);
  //Get Meessage
  const [messages, setMessages] = useState<any[any]>([]);

  //loading
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuthStore((state: any) => state);

  ///conversation infor
  const [conversationInfor, setConversationInfor] = useState<any>();

  //userOnline

  const [usersOnline, setUsersOnline] = useState<any>();
  // Setting socket.io

  const socket = useRef<any>();

  // Get message live socket.io

  useEffect(() => {
    socket.current = io(URL_ENV);

    socket.current.on("getMessage", (data: any) => {
      setTimeout(() => {
        setRefresh((f) => f + 1);
      }, 3000);
    });

    // Cleanup the socket connection on component unmount
  }, [URL_ENV, socket]);

  //Get User Online SOCKET.IO
  useEffect(() => {
    socket.current.on("getUsers", (users: any) => {
      setUsersOnline(
        users.filter((user: any) => user.userId !== auth.payload._id)
      );
      setRefresh((f) => f + 1);
    });
  }, [auth]);

  //GEt all Users
  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const res = await axiosClientJson.get(`/employees`);
        const dataIn = res.data.results.filter(
          (item: any) => item._id !== auth.payload._id
        );
        getUsers(dataIn);
      } catch (err) {}
    };
    getAllUsers();
  }, [URL_ENV, auth.payload._id]);

  /// BƯỚC ĐẦU TIÊN LẤY CONVERSATION VỀ
  //Get conversation
  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axiosClientJson.get(
          `/conversations/${auth.payload._id}`
        );
        setConversations(res.data);
        setLoading(true);
      } catch (err) {}
    };
    getConversations();
  }, [URL_ENV, auth.payload._id, refresh]);

  /// TẠO CONVERSATION ( TẠO ROOM CHAT CHO 2 người )
  //Create a conversation

  const handleCreateConversation = async (e: any) => {
    if (e.userId) {
      const conversationCreate = {
        senderId: `${auth.payload._id}`,
        receiverId: `${e.userId}`,
      };
      try {
        const res = await axiosClientJson.post(
          `/conversations`,
          conversationCreate
        );
        if (res) {
          setOpenCreateConver(false);
          setRefresh((f) => f + 1);
          message.success("Create a conversation successfully!!", 1.5);
        }
      } catch (error) {
        console.log("««««« error »»»»»", error);
      }
    } else {
      message.error("Please select a person", 2);
    }
  };

  /// Gửi tin nhắn đến socket nhận tín hiệu, đồng thời gửi tin nhắn để lưu vào mongoDB
  //Function send message
  const handleSendMessages = async (e: any) => {
    const messageSend = {
      sender: auth.payload._id,
      text: e.text,
      conversationId: conversationInfor.conversationId,
    };

    const receiverId = conversationInfor.friends._id;

    socket.current.emit("sendMessage", {
      senderId: `${auth.payload._id}`,
      receiverId: receiverId,
      text: e.text,
    });

    try {
      const res = await axiosClientJson.post(`/messages`, messageSend);
      setRefresh((f) => f + 1);
      setMessages([...messages, res.data]);
      createForm.resetFields();

      setTimeout(() => {
        const inputInstance = formRef.current.getFieldInstance("text");
        inputInstance.focus();
      }, 30);
    } catch (error) {
      console.log("««««« error »»»»»", error);
    }
  };

  //GET MESSAGE
  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axiosClientJson.get(
          `/messages/${conversationInfor.conversationId}`
        );
        setMessages(res.data);
      } catch (error) {}
    };
    getMessages();
  }, [URL_ENV, conversationInfor, refresh]);

  /// PART OF CHATBOX

  // Scroll to the bottom of the messages after they are updated

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);
  scrollRef?.current?.scrollIntoView({ behavior: "smooth" });

  //frienData là danh sách cuộc hội thoại có với auth
  const [friendData, setFriendData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      /// Lấy ra conversation ( room chat của auth với friend, chỉ là bước check lại)
      const conversationsWithAuthMember = conversations.filter((item: any) =>
        item.members.includes(auth.payload._id)
      );

      /// Lấy thông tin của từng friend mà có conversation với auth
      const friendPromises = conversationsWithAuthMember.map(
        async (item: any) => {
          // Lấy _id của từng friend
          const otherMembers = item.members.filter(
            (member: any) => member !== auth.payload._id
          );

          //Sau khi có Id thì lấy toàn bộ thông tin của của friend, để lấy firstName, lastName hiển thị
          try {
            const response = await axiosClientJson.get(
              `/employees/${otherMembers}`
            );
            const friendData = response.data.result;
            const friendInfo = {
              conversationId: item._id,
              friends: friendData
                ? {
                    ...friendData,
                    _id: friendData._id.toString(),
                  }
                : null,
            };
            return friendInfo;
          } catch (error) {
            console.log("Error fetching friend information:", error);
            const friendInfo = {
              conversationId: item._id,
              friends: null,
            };
            return friendInfo;
          }
        }
      );

      const friendInfo = await Promise.all(friendPromises);
      //Hàm Promise.all được sử dụng để kết hợp một mảng các promise thành một promise duy nhất
      //nó trả về một promise mới sẽ được giải quyết khi tất cả các promise trong mảng đã được giải quyết.

      ///Promise.all(friendPromises) đợi cho tất cả các promise trong mảng friendPromises được giải quyết hoặc bị từ chối. Khi tất cả các promise đã được giải quyết, nó trả về một promise mới.
      setFriendData(friendInfo);
    };

    fetchData();
  }, [conversations, auth.payload._id, URL_ENV]);

  return (
    <>
      <Card style={{ minHeight: "84vh" }}>
        {!loading ? (
          <Card style={{ width: 300, marginTop: 16 }} loading={true}></Card>
        ) : (
          <Row>
            <Col xs={24} xl={7}>
              <div>
                <Button
                  onClick={() => setOpenCreateConver(true)}
                  type="dashed"
                  shape="circle"
                  icon={<PlusCircleOutlined />}
                />{" "}
                <span className="text-primary">New conversation?</span>
              </div>

              {/* Model create coversation  */}
              <Modal
                open={openCreateConver}
                onCancel={() => setOpenCreateConver(false)}
                onOk={() => {
                  createConversationForm.submit();
                }}
                okText="Create"
              >
                <Form
                  className="container px-5"
                  form={createConversationForm}
                  name="createConversationForm"
                  onFinish={handleCreateConversation}
                >
                  <Form.Item
                    labelCol={{
                      span: 8,
                    }}
                    wrapperCol={{
                      span: 16,
                    }}
                    hasFeedback
                    label="Name"
                    name="userId"
                  >
                    <Select
                      allowClear
                      showSearch
                      placeholder="Select a person"
                      optionFilterProp="children"
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={users.map((item: any, index: any) => {
                        return {
                          label: `${item.firstName} ${item.lastName}`,
                          value: item._id,
                          key: `${item._id}-${index}`,
                        };
                      })}
                    />
                  </Form.Item>{" "}
                </Form>
              </Modal>

              {/* LIST OF FRIEND */}
              <div
                className="conversation"
                style={{ height: "150px", overflowY: "auto" }}
              >
                {friendData?.map((friends: any, index: any) => (
                  <div key={`${friends.friends._id}-${index}`}>
                    <Button
                      onClick={() => setConversationInfor(friends)}
                      className="text-start"
                      style={{ width: "100%", height: "50px" }}
                    >
                      {friends?.friends?.firstName} {friends?.friends?.lastName}
                    </Button>
                  </div>
                ))}
              </div>
            </Col>
            <Col xs={24} xl={17}>
              {conversationInfor ? (
                <Card
                  key={`${conversationInfor.friends._id}`}
                  type="inner"
                  title={`${conversationInfor?.friends.firstName} ${conversationInfor?.friends.lastName} 
                
                  `}
                  extra={
                    usersOnline?.some(
                      (user: any) =>
                        user.userId === conversationInfor.friends._id
                    ) ? (
                      <div>
                        <Space>
                          <CheckCircleTwoTone twoToneColor="#52c41a" />
                          Online
                        </Space>
                      </div>
                    ) : (
                      <div>
                        <Space>
                          <CheckCircleTwoTone twoToneColor="#eb2f96" />
                          Offline
                        </Space>
                      </div>
                    )
                  }
                  bordered={false}
                  style={{ width: "auto" }}
                >
                  <div
                    ref={scrollRef}
                    style={{ height: "400px", overflowY: "scroll" }}
                  >
                    {messages?.map((item: any, index: number) => (
                      <div key={`${item?.employee._id}-${index}`}>
                        {item?.employee?._id === auth.payload._id ? (
                          <div className="d-flex flex-row-reverse">
                            <div className="w-auto">
                              <h6 className="Name text-body-secondary">
                                <UserOutlined /> Me
                              </h6>
                              <h5 className="bg-light-subtle border rounded-2 text-break px-2 py-2">
                                {item?.text}
                              </h5>
                              <div className="text-end">
                                {format(item.createdAt)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="d-flex"
                            key={`${item?.employee._id}-${index}`}
                          >
                            <div className="w-auto">
                              <h6 className="Name text-primary">
                                <UserOutlined /> {item?.employee?.firstName}{" "}
                                {item?.employee?.lastName}
                              </h6>
                              <h5 className="text-white bg-primary border rounded-2 px-2 py-2 text-break">
                                {item.text}
                              </h5>
                              <div className="text-start">
                                {format(item.createdAt)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Form
                    style={{ marginTop: "50px" }}
                    key={conversationInfor}
                    form={createForm}
                    name="createForm"
                    onFinish={handleSendMessages}
                    ref={formRef}
                  >
                    <Space.Compact style={{ width: "100%" }}>
                      <Form.Item style={{ width: "100%" }} name="text">
                        <Input type="text" placeholder="Enter text" />
                      </Form.Item>
                      <Form.Item>
                        <Button
                          icon={<SendOutlined />}
                          type="dashed"
                          htmlType="submit"
                        />
                      </Form.Item>
                    </Space.Compact>
                  </Form>
                </Card>
              ) : (
                <Watermark
                  key={`${conversationInfor?.friends._id}`}
                  content="Click to user to start conversation"
                >
                  <div style={{ height: 500 }} />
                </Watermark>
              )}
            </Col>
          </Row>
        )}
      </Card>
    </>
  );
};

export default Messages;
