import LazyFadeImage from "@/components/Images/Lazy";
import useWindowWidth from "@/hooks/useWidth";
import { ASSET_URL } from "@/utils/constants/URLS";
import { devLog } from "@/utils/logger";
import { appendDomain, createFormData } from "@/utils/stringUtils";
import { User } from "@/utils/types/Entities";
import { useQuery } from "@tanstack/react-query";
import type { GetProp, UploadProps } from "antd";
import {
  Button,
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

const useUserProfile = () => {
  const token = window.localStorage.getItem("token");
  const {
    data: axiosResponse,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["get_self_employee", token],
    queryFn: () => {
      return axiosClientJson.get(`/employees/personal`);
    },
    refetchInterval: 60 * 1000 * 1, // 1 min
  });
  return { error, isLoading, user: axiosResponse?.data.result };
};

const Information = () => {
  const width = useWindowWidth();
  const isLargeScreen = width > 896;
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
      const validUser: Omit<WithId<User>, "birthday"> & { birthday: Dayjs } = {
        ...user,
        birthday: dayjs(user?.birthday),
      };
      form.setFieldsValue(validUser);
    }
  }, [user, form]);
  return (
    <Flex className="bg-white gap-5 h-[80vh]" justify="center">
      <div className="pt-10 w-full px-32">
        <Flex
          align="start"
          className="pt-[100px]"
          gap={80}
          justify="space-between"
        >
          <div className="basis-2/3">
            <h4 className="text-2xl font-bold bg-amber-200">
              Thông tin tài khoản
            </h4>
            <Flex gap={20}>
              <Space
                direction="vertical"
                className={`flex flex-col items-center`}
              >
                <LazyFadeImage
                  src={
                    avatarSrc ?? appendDomain(user?.imageUrl || "", ASSET_URL)
                  }
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                  width={200}
                  height={250}
                  fallback="/placeholder-user.jpg"
                  preview
                />
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
                  <Button>Thay ảnh đại diện</Button>
                </Upload>
              </Space>
              <Flex gap={20} vertical={true} className="grow">
                <Space
                  direction="vertical"
                  style={{ minWidth: isLargeScreen ? "30rem" : "5rem" }}
                >
                  <Form
                    form={form}
                    labelWrap
                    labelCol={{ xs: 6 }}
                    labelAlign="left"
                    wrapperCol={{ xs: 18 }}
                    style={{ width: "100%" }}
                    className="bg-white rounded-md max-w-5xl p-6 mx-auto"
                    variant="outlined"
                    onFinish={async (values: User) => {
                      // values.birthday = values.birthday.toISOString();
                      const text = values;
                      try {
                        const publicUrl = await uploadAvatarGCS();
                        const updateJsonData = {
                          ...text,
                          birthday: text.birthday?.toISOString(),
                          imageUrl: publicUrl,
                        };
                        await axiosClientJson.patch(
                          `/employees/${userId}`,
                          updateJsonData
                        );
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
                      rules={[
                        { required: true, message: "Nhap dia chi email" },
                      ]}
                    >
                      <Input size="large" />
                    </Form.Item>
                    <Form.Item
                      label="Số điện thoại"
                      name="phoneNumber"
                      rules={[
                        { required: true, message: "Nhap so dien thoai" },
                      ]}
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
          </div>
          {/** Password Update Form */}
          <div className="basis-1/3">
            <h4 className="text-2xl font-bold bg-amber-200">Đổi mật khẩu</h4>
            <Flex justify={"start"}>
              <Form
                // className="max-w-6xl"
                labelCol={{ xs: 8 }}
                labelAlign="left"
                colon={false}
                wrapperCol={{ xs: 16 }}
                style={{ height: "100%", width: "100%" }}
                labelWrap
                onFinish={async function (values: object) {
                  try {
                    await axiosClientJson.patch(`/employees/${userId}`, values);
                    message.success("Update information successfully", 1.5);
                  } catch {
                    message.error("Update information failed", 1.5);
                  }
                }}
                onFinishFailed={function (error: unknown) {
                  devLog("finish failed:", error);
                }}
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
            </Flex>
          </div>
        </Flex>
      </div>
    </Flex>
  );
};

export default Information;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};
