import useWindowWidth from "@/hooks/useWidth";
import { ASSET_URL } from "@/utils/constants/URLS";
import { devLog } from "@/utils/logger";
import { appendDomain } from "@/utils/stringUtils";
import { User } from "@/utils/types/Entities";
import { useQuery } from "@tanstack/react-query";
import type { GetProp, UploadProps } from "antd";
import {
  Button,
  DatePicker,
  Flex,
  Form,
  Image,
  Input,
  Select,
  Space,
  Tabs,
  Upload,
  message,
} from "antd";
import { RcFile } from "antd/es/upload";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { WithId } from "utils/types/Entities";
import { axiosClientForm, axiosClientJson } from "../../libraries/axiosClient";

const useUserProfile = () => {
  const [user, setUser] = useState<WithId<User>>();
  const token = window.localStorage.getItem("token");
  const { data: userData } = useQuery({
    queryKey: ["get_self_employee", token],
    queryFn: () => {
      return axiosClientJson.get(`/employees/personal`);
    },
    refetchInterval: 2 * 60 * 1000, // 2 mins
  });
  useEffect(() => {
    const result = userData?.data?.result;
    if (result) {
      setUser(result);
    }
  }, [userData]);
  return user;
};

const Information = () => {
  const width = useWindowWidth();
  const isLargeScreen = width > 896;
  return (
    <div className=" bg-white gap-5 p-6">
      <Tabs tabPosition={isLargeScreen ? "left" : "top"} defaultActiveKey="1">
        <TabPane tab="Cập nhật thông tin" key="1">
          <InformationForm />
        </TabPane>
        <TabPane tab="Đổi mật khẩu" key="2">
          <ChangePasswordForm />
        </TabPane>
      </Tabs>
    </div>
  );
};

const { TabPane } = Tabs;

export default Information;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

function InformationForm() {
  const [form] = Form.useForm();
  const user = useUserProfile();
  const userId = user?._id ?? "";
  const [avatarSrc, setAvatarSrc] = useState<string>();
  const [avatarFile, setAvatarFile] = useState<File>();

  const handleChange: UploadProps["onChange"] = (info) => {
    devLog("info", info);
    getBase64(info.file as FileType, (url) => {
      setAvatarSrc(url);
      setAvatarFile(info.file as RcFile);
    });
  };

  function handleFinish(values: User) {
    // values.birthday = values.birthday.toISOString();
    const text = values;
    return axiosClientJson
      .patch(`/employees/${userId}`, {
        ...text,
        birthday: text.birthday?.toISOString(),
      })
      .then(() => {
        if (!avatarFile) {
          return;
        }
        const formData = new FormData();
        formData.append("file", avatarFile);
        return axiosClientForm.post(
          `/upload/employees/${userId}/image`,
          formData
        );
      })
      .catch(() => {
        message.error("Update information failed", 1.5);
      });
  }

  function handleFinishFailed(error: unknown) {
    console.error("finish failed:", error);
  }

  useEffect(() => {
    if (user) {
      const validUser: Omit<WithId<User>, "birthday"> & { birthday: Dayjs } = {
        ...user,
        birthday: dayjs(user?.birthday),
      };
      form.setFieldsValue(validUser);
    }
  }, [user]);

  const width = useWindowWidth();
  const isLargeScreen = width > 1024;

  return (
    <Flex className="pl-8" justify={isLargeScreen ? "start" : "center"}>
      <Flex gap={20} vertical={!isLargeScreen}>
        <Space direction="vertical" className={`flex flex-col items-center`}>
          <Image
            src={avatarSrc ?? appendDomain(user?.imageUrl || "", ASSET_URL)}
            style={{ objectFit: "cover" }}
            loading="lazy"
            width={200}
            height={200}
          />
          <Upload
            beforeUpload={() => false}
            onChange={handleChange}
            showUploadList={false}
            maxCount={1}
          >
            <Button>Thay ảnh đại diện</Button>
          </Upload>
        </Space>
        <Space
          direction="vertical"
          style={{ minWidth: isLargeScreen ? "30rem" : "5rem" }}
        >
          <Form
            form={form}
            labelCol={{ xs: 4 }}
            labelWrap
            wrapperCol={{ xs: 20 }}
            className=" bg-white rounded-md max-w-3xl p-6 mx-auto"
            variant="outlined"
            onFinish={handleFinish}
            onFinishFailed={handleFinishFailed}
            colon={false}
          >
            <Form.Item
              label="Tên"
              name="firstName"
              rules={[{ required: true, message: "Nhap ten cua ban" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label="Họ"
              name="lastName"
              rules={[{ required: true, message: "Nhap ho cua ban" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Nhap dia chi email" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[{ required: true, message: "Nhap so dien thoai" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Nhap dia chi nha" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label="Ngày sinh"
              name="birthday"
              rules={[{ required: true, message: "Nhap ngay sinh" }]}
            >
              <DatePicker size="large" />
            </Form.Item>
            <Form.Item label="Giới tính" name="gender">
              <Select
                size="large"
                options={[
                  { label: "Nam", value: "male" },
                  { label: "Nu", value: "female" },
                  { label: "Khac", value: "other" },
                ]}
              />
            </Form.Item>
            <Flex gap={"middle"} justify="end" align="center">
              <Button
                size="large"
                onClick={() => {
                  if (user) {
                    form.setFieldsValue({
                      ...user,
                      birthday: user?.birthday
                        ? dayjs(user.birthday)
                        : undefined,
                    });
                  }
                }}
              >
                Khôi phục
              </Button>
              <Button type="primary" htmlType="submit" size="large">
                Cập nhật
              </Button>
            </Flex>
          </Form>
        </Space>
      </Flex>
    </Flex>
  );
}

function ChangePasswordForm() {
  const user = useUserProfile();
  const userId = user?._id ?? "";
  async function handleFinish(values: object) {
    try {
      await axiosClientJson.patch(`/employees/${userId}`, values);
      message.success("Update information successfully", 1.5);
    } catch {
      message.error("Update information failed", 1.5);
    }
  }
  function handleFinishFailed(error: unknown) {
    devLog("finish failed:", error);
  }
  return (
    <Form
      className="max-w-3xl mx-auto"
      labelCol={{ xs: 5 }}
      wrapperCol={{ xs: 19 }}
      labelWrap
      variant="underlined"
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
    >
      <Form.Item label="Mật khẩu cũ" name="oldPassword">
        <Input.Password size="large" />
      </Form.Item>
      <Form.Item label="Mật khẩu mới" name="password">
        <Input.Password size="large" />
      </Form.Item>
      <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword">
        <Input.Password size="large" />
      </Form.Item>
      <Flex justify="end">
        <Button type="primary" htmlType="submit" size="large">
          Cập nhật dữ liệu
        </Button>
      </Flex>
    </Form>
  );
}
