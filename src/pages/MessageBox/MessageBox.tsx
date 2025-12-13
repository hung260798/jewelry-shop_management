import React, { useCallback, useEffect, useState } from "react";
import { Affix, Button, Card, Form, Input, Popover, Select, Space } from "antd";
import { EditFilled, WechatOutlined } from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "utils/constants/URLS";

const MessageBox: React.FC = () => {
  const [users, setUsers] = useState<any>();
  const [userName, setUserName] = useState("");

  const API_USERS = `${API_URL}/employees`;
  useEffect(() => {
    axios
      .get(API_USERS)
      .then((res) => {
        setUsers(res.data.results);
      })
      .catch((err) => console.log(err.name));
  }, [API_USERS]);

  const onSearchUser = useCallback((record: any, label: any) => {
    if (record) {
      setUserName(label.label);
    } else {
      setUserName("");
    }
  }, []);

  const tabChatBox = [
    {
      key: "chatbox",
      tab: `${userName}`,
    },
  ];
  const contentChatBox: Record<string, React.ReactNode> = {
    chatbox: (
      <>
        <div></div>
        <Form className="container py-5" name="chatForm">
          <Form.Item name="message" noStyle>
            <Input style={{ width: 160 }} />
          </Form.Item>
          <Button
            style={{ width: "30px", right: "-4px" }}
            type="dashed"
            htmlType="submit"
            icon={<EditFilled />}
          />
        </Form>
      </>
    ),
  };
  const content = (
    <div>
      <Space.Compact className="py-3" style={{ width: "100%" }}>
        <span className="px-2 py-1">To: </span>

        <Select
          allowClear
          autoClearSearchValue={!users ? true : false}
          showSearch
          style={{ width: "100%" }}
          placeholder="Select a user"
          optionFilterProp="children"
          onChange={onSearchUser}
          filterOption={(input: any, option: any) =>
            (option?.label ?? "").toLowerCase().indexOf(input.toLowerCase()) >=
            0
          }
          options={users?.map((item: any) => ({
            label: item.lastName,
            value: item?._id,
          }))}
        />
      </Space.Compact>
      {userName && (
        <Card
          style={{ width: "400px" }}
          tabList={tabChatBox}
          activeTabKey={"chatbox"}
        >
          {contentChatBox["chatbox"]}
        </Card>
      )}
    </div>
  );
  return (
    <>
      <Affix offsetBottom={50} className="text-end">
        <Popover
          style={{ paddingLeft: "0px" }}
          placement="leftBottom"
          title={"New messages"}
          content={content}
          trigger="click"
        >
          <Button
            style={{ width: "40px", height: "40px" }}
            icon={<WechatOutlined />}
            type="dashed"
            shape="circle"
          ></Button>
        </Popover>
      </Affix>
    </>
  );
};

export default MessageBox;
