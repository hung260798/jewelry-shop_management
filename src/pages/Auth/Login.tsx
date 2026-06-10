import { API_URL } from "@/utils/constants/URLS";
import { devLog } from "@/utils/logger";
import { Button, Form, Input, message } from "antd";
import axios, { AxiosError } from "axios";
import { AuthUser, useAuthStore } from "hooks/stores/useAuthStore";
import { User } from "utils/types/Entities";
import style from "./login.module.css";

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
      if (loginResponse.status > 300 || loginResponse.status < 200) {
        message.error("Login unsuccessfully!!");
        return;
      }
      localStorage.setItem("token", loginResponse.data.token);
      if (loginResponse.data.refreshToken) {
        localStorage.setItem("refreshToken", loginResponse.data.refreshToken);
      }
      const profileResponse = await noAuthClient.get<AuthUser>(
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
        const clientMessage =
          err.response?.data?.clientMessage || err.response?.data?.message;
        if (err.status === 401) {
          message.error(clientMessage || "Không có quyền truy cập", 1.5);
        } else {
          message.error(clientMessage || "Lỗi máy chủ", 1.5);
        }
      } else {
        message.error("Lỗi không xác định", 1.5);
      }
      devLog(err);
    }
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
          onFinish={async (values) => {
            await login(values);
          }}
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
