import { API_URL } from "@/utils/constants/URLS";
import { Button, Form, Input, Select, Space } from "antd";
import axios from "axios";
import { useState } from "react";

export default function UpdatePage() {
  const [form] = Form.useForm();
  const [result, setResult] = useState<string>();
  return (
    <div>
      <Form
        form={form}
        onFinish={(values) => {
          (async () => {
            try {
              const { collectionName, id, method, content, query } = values;
              console.log("values", values);
              const BASE = `${API_URL}/${collectionName}`;
              switch (method) {
                case "POST": {
                  const rs = await axios.post(`${BASE}`, JSON.parse(content));
                  setResult(JSON.stringify(rs.data, null, 2));
                  break;
                }
                case "PATCH": {
                  const rs = await axios.patch(
                    `${BASE}/${id}`,
                    JSON.parse(content)
                  );
                  setResult(JSON.stringify(rs.data, null, 2));
                  break;
                }
                case "GET": {
                  let rs;
                  if (id) {
                    rs = await axios.get(`${BASE}/${id}`);
                  } else if (query) {
                    rs = await axios.get(`${BASE}?${query}`);
                  } else {
                    rs = await axios.get(`${BASE}`);
                  }
                  setResult(JSON.stringify(rs.data, null, 2));
                  break;
                }
                case "DELETE": {
                  const rs = await axios.delete(
                    `${API_URL}/${collectionName}/${id}`
                  );
                  setResult(JSON.stringify(rs.data, null, 2));
                  break;
                }
              }
            } catch (error) {
              setResult("error");
              console.log("error", error);
            }
          })();
        }}
        labelCol={{
          xl: 4,
        }}
        wrapperCol={{ xl: 16 }}
      >
        <Form.Item name={"collectionName"} label="Collection">
          <Input />
        </Form.Item>
        <Form.Item name={"id"} label="Id">
          <Input />
        </Form.Item>
        <Form.Item name={"query"} label="Query string">
          <Input />
        </Form.Item>
        <Form.Item name={"content"} label="Update content (JSON)">
          <Input.TextArea rows={5} cols={80} />
        </Form.Item>
        <Form.Item name={"method"} label="Method">
          <Select
            options={[
              { label: "post", value: "POST" },
              { label: "patch", value: "PATCH" },
              { label: "del", value: "DELETE" },
              { label: "get", value: "GET" },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button htmlType="reset">Reset</Button>
            <Button
              htmlType="button"
              onClick={() => {
                setResult("");
              }}
            >
              Clear result
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <section>
        <h3>Result</h3>
        <pre>{result}</pre>
      </section>
    </div>
  );
}
