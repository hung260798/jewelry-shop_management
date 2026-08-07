import LazyFadeImage from "@/components/Images/Lazy";
import { ASSET_URL } from "@/utils/constants/URLS";
import { devLog } from "@/utils/logger";
import { appendDomain, createFormData } from "@/utils/stringUtils";
import { User } from "@/utils/types/Entities";
import {
  CameraOutlined,
  LockOutlined,
  ReloadOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { GetProp, Grid, UploadProps } from "antd";
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  Input,
  Select,
  Space,
  Upload,
  message,
} from "antd";
import { RcFile } from "antd/es/upload";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { WithId } from "utils/types/Entities";
import { axiosClientForm, axiosClientJson } from "../../libraries/axiosClient";
import style from "./Information.module.css";

const useUserProfile = () => {
  const token = window.localStorage.getItem("token");
  const {
    data: axiosResponse,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["self_employee", { token }],
    queryFn: () => {
      return axiosClientJson.get(`/employees/personal`);
    },
    refetchInterval: 60 * 1000 * 1, // 1 min
  });
  return { error, isLoading, user: axiosResponse?.data.result };
};

const Information = () => {
  const [form] = Form.useForm();
  const { user } = useUserProfile();
  const userId = user?._id ?? "";
  const [avatarSrc, setAvatarSrc] = useState<string>();
  const [avatarFile, setAvatarFile] = useState<File>();
  /**
   *
   * @returns publicUrl của avatar
   */
  async function uploadAvatarGCS() {
    if (!avatarFile) {
      return undefined;
    }
    const formData = createFormData(avatarFile, "file");
    if (!formData) {
      return undefined;
    }
    formData.append(
      "sizes",
      JSON.stringify([
        [100, 100],
        [200, 200],
      ])
    );
    const fileUploadResponse = await axiosClientForm.postForm<
      { publicUrl: string } | { publicUrls: string[] }
    >(`/upload/gcs-upload`, formData);
    return "publicUrl" in fileUploadResponse.data
      ? fileUploadResponse.data.publicUrl
      : undefined;
  }
  useEffect(() => {
    if (user && form) {
      const validUser: Omit<WithId<User>, "birthday"> & {
        birthday?: Dayjs;
      } = {
        ...user,
        birthday: user?.birthday ? dayjs(user.birthday) : undefined,
      };
      form.setFieldsValue(validUser);
    }
  }, [user, form]);

  const screens = Grid.useBreakpoint();
  const formLabelCol = screens.md ? { span: 7 } : { span: 24 };
  const formWrapperCol = screens.md ? { span: 17 } : { span: 24 };
  const avatarUrl = avatarSrc ?? appendDomain(user?.imageUrl || "", ASSET_URL);

  return (
    <main className={style.root}>
      <div className={style.pageHeader}>
        <div>
          <span className={style.eyebrow}>Tài khoản</span>
          <h1>Thông tin cá nhân</h1>
        </div>
        <div className={style.headerBadge}>
          <UserOutlined />
          <span>{user?.email || "Đang tải hồ sơ"}</span>
        </div>
      </div>

      <div className={style.contentGrid}>
        <Card className={style.profileCard} bordered={false}>
          <div className={style.sectionTitle}>
            <div>
              <h2>Hồ sơ nhân viên</h2>
              <p>Cập nhật thông tin liên hệ và ảnh đại diện.</p>
            </div>
          </div>

          <div className={style.profileLayout}>
            <aside className={style.avatarPanel}>
              <div className={style.avatarFrame}>
                <LazyFadeImage
                  src={avatarUrl}
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                  width="100%"
                  height="100%"
                  fallback="/placeholder-user.jpg"
                  preview
                />
              </div>
              <Space
                direction="vertical"
                size={10}
                className={style.avatarMeta}
              >
                <strong>
                  {[user?.lastName, user?.firstName]
                    .filter(Boolean)
                    .join(" ") || "Nhân viên"}
                </strong>
                <span>{user?.phoneNumber || "Chưa có số điện thoại"}</span>
                <Upload
                  beforeUpload={() => false}
                  onChange={(info) => {
                    devLog("info", info);
                    getBase64(info.file as FileType, (url) => {
                      setAvatarSrc(url);
                      setAvatarFile(info.file as RcFile);
                    });
                  }}
                  showUploadList={false}
                  maxCount={1}
                >
                  <Button icon={<CameraOutlined />}>Thay ảnh đại diện</Button>
                </Upload>
              </Space>
            </aside>

            <Form
              form={form}
              labelWrap
              labelCol={formLabelCol}
              labelAlign="left"
              wrapperCol={formWrapperCol}
              className={style.form}
              variant="outlined"
              onFinish={async (values: User) => {
                const text = values;
                try {
                  const publicUrl = await uploadAvatarGCS();
                  const updateJsonData = {
                    ...text,
                    birthday: text.birthday?.toISOString(),
                    ...(publicUrl ? { imageUrl: publicUrl } : {}),
                  };
                  await axiosClientJson.patch(
                    `/employees/${userId}`,
                    updateJsonData
                  );
                  setAvatarFile(undefined);
                  message.success("Cập nhật thông tin thành công", 1.5);
                } catch {
                  message.error("Cập nhật thông tin thất bại", 1.5);
                }
              }}
              onFinishFailed={function (error: unknown) {
                devLog("finish failed:", error);
                message.error("Submit thất bại", 1.5);
              }}
              colon={false}
            >
              <div className={style.fieldGrid}>
                <Form.Item
                  label="Tên"
                  name="firstName"
                  rules={[{ required: true, message: "Nhập tên của bạn" }]}
                >
                  <Input size="large" placeholder="Tên" />
                </Form.Item>
                <Form.Item
                  label="Họ"
                  name="lastName"
                  rules={[{ required: true, message: "Nhập họ của bạn" }]}
                >
                  <Input size="large" placeholder="Họ" />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Nhập địa chỉ email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input size="large" placeholder="email@company.com" />
                </Form.Item>
                <Form.Item
                  label="Số điện thoại"
                  name="phoneNumber"
                  rules={[{ required: true, message: "Nhập số điện thoại" }]}
                >
                  <Input size="large" placeholder="Số điện thoại" />
                </Form.Item>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  className={style.fullWidth}
                  rules={[{ required: true, message: "Nhập địa chỉ nhà" }]}
                >
                  <Input size="large" placeholder="Địa chỉ liên hệ" />
                </Form.Item>
                <Form.Item
                  label="Ngày sinh"
                  name="birthday"
                  rules={[{ required: true, message: "Nhập ngày sinh" }]}
                >
                  <DatePicker size="large" className={style.fullControl} />
                </Form.Item>
                <Form.Item label="Giới tính" name="gender">
                  <Select
                    size="large"
                    placeholder="Chọn giới tính"
                    options={[
                      { label: "Nam", value: "male" },
                      { label: "Nữ", value: "female" },
                      { label: "Khác", value: "other" },
                    ]}
                  />
                </Form.Item>
              </div>

              <Flex gap={"middle"} justify="end" align="center" wrap>
                <Button
                  icon={<ReloadOutlined />}
                  size="large"
                  onClick={() => {
                    if (user) {
                      form.setFieldsValue({
                        ...user,
                        birthday: user?.birthday
                          ? dayjs(user.birthday)
                          : undefined,
                      });
                      setAvatarSrc(undefined);
                      setAvatarFile(undefined);
                    }
                  }}
                >
                  Khôi phục
                </Button>
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  htmlType="submit"
                  size="large"
                >
                  Cập nhật
                </Button>
              </Flex>
            </Form>
          </div>
        </Card>

        <Card className={style.securityCard} bordered={false}>
          <div className={style.sectionTitle}>
            <div className={style.iconTitle}>
              <span className={style.titleIcon}>
                <LockOutlined />
              </span>
              <div>
                <h2>Đổi mật khẩu</h2>
                <p>Đặt mật khẩu mới cho tài khoản quản trị.</p>
              </div>
            </div>
          </div>

          <Form
            labelCol={formLabelCol}
            labelAlign="left"
            colon={false}
            wrapperCol={formWrapperCol}
            className={style.form}
            labelWrap
            onFinish={async function (values: object) {
              try {
                await axiosClientJson.patch(`/employees/${userId}`, values);
                message.success("Cập nhật mật khẩu thành công", 1.5);
              } catch {
                message.error("Cập nhật mật khẩu thất bại", 1.5);
              }
            }}
            onFinishFailed={function (error: unknown) {
              devLog("finish failed:", error);
            }}
          >
            <Form.Item
              label="Mật khẩu cũ"
              name="oldPassword"
              rules={[{ required: true, message: "Nhập mật khẩu cũ" }]}
            >
              <Input.Password size="large" placeholder="Mật khẩu hiện tại" />
            </Form.Item>
            <Form.Item
              label="Mật khẩu mới"
              name="password"
              rules={[
                { required: true, message: "Nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu cần tối thiểu 6 ký tự" },
              ]}
            >
              <Input.Password size="large" placeholder="Mật khẩu mới" />
            </Form.Item>
            <Form.Item
              label="Xác nhận"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Item>
            <Flex justify="end">
              <Button
                icon={<SaveOutlined />}
                type="primary"
                htmlType="submit"
                size="large"
              >
                Cập nhật mật khẩu
              </Button>
            </Flex>
          </Form>
        </Card>
      </div>
    </main>
  );
};

export default Information;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};
