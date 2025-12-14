import { Button, Form, Input, message } from "antd";
import { useAuthStore } from "hooks/useAuthStore";
import style from "./login.module.css";
import axios, { AxiosError } from "axios";
import { API_URL } from "@/utils/constants/URLS";
import { User, WithId } from "utils/types/Entities";
import { devLog } from "@/utils/logger";

const noAuthClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const Login = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const login = async (account: { email: string; password: string }) => {
    try {
      const loginResponse = await noAuthClient.post<{
        token: string;
        refreshToken?: string;
        user?: User;
      }>("/employees/login", account);
      if (
        loginResponse.status > 300 ||
        loginResponse.status < 200 ||
        "message" in loginResponse.data
      ) {
        message.error("Login unsuccessfully!!");
        return;
      }
      localStorage.setItem("token", loginResponse.data.token);
      if (loginResponse.data.refreshToken) {
        localStorage.setItem("refreshToken", loginResponse.data.refreshToken);
      }
      const profileResponse = await noAuthClient.get<WithId<User>>(
        `/employees/login/profile`,
        {
          headers: {
            Authorization: `Bearer ${loginResponse.data.token}`,
          },
        }
      );
      if (profileResponse.status !== 200) {
        message.error("Fetch profile unsuccessfully!!");
        return;
      }
      const user = profileResponse.data;
      setAuth({ ...loginResponse.data, user: user });
      message.success("Login sucesfully!!");
    } catch (err: unknown) {
      setAuth(null);
      if (err instanceof AxiosError) {
        if (err.status === 401) {
          message.error("Unauthorized", 1.5);
        } else {
          message.error("Request error");
        }
      } else {
        message.error("Unknown error", 1.5);
      }
      devLog(err);
    }
  };
  const handleSubmit = async (values: any) => {
    await login(values);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className={`${style.form_box}`}>
        <h2 className={`${style.title}`}>Login</h2>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{
            maxWidth: 600,
            width: "100%",
            padding: "3rem",
          }}
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email không được để trống" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
            validateTrigger="onBlur"
            className="mb-5"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Mật khẩu không được để trống" },
              {
                min: 6,
                max: 10,
                message: "Độ dài mật khẩu phải nằm trong khoảng 6 đến 10 ký tự",
              },
            ]}
            validateTrigger="onBlur"
            className="mb-5"
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="dashed" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
