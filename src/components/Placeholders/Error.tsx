import { Button, Result, Space } from "antd";

export default function Error() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Result
        status="error"
        title="Rất tiếc! Đã xảy ra sự cố"
        subTitle="Đã xảy ra lỗi không mong muốn. Vui lòng tải lại trang hoặc quay về trang chủ."
        extra={
          <Space wrap>
            <Button type="primary" onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
            <Button onClick={() => (window.location.href = "/")}>
              Về trang chủ
            </Button>
          </Space>
        }
      />
    </div>
  );
}
