import { axiosClientJson } from "@/libraries/axiosClient";
import { OrderStatus } from "@/meta/OrderStatus";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  FormProps,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import React from "react";
import { Order, WithId } from "@/utils/types/Entities";
import { ColumnsType } from "antd/es/table";
import numeral from "numeral";
import { devLog } from "@/utils/logger";
import { GetManyData } from "@/utils/mutationFn";
import {
  ClearOutlined,
  FilterOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

const statusColors: Record<string, string> = {
  WAITING: "gold",
  ECONFIRMED: "blue",
  COMPLETED: "green",
  CANCELED: "red",
};

const statusLabelByValue = OrderStatus.reduce<Record<string, string>>(
  (labels, item) => {
    labels[item.value] = item.label.replace(/^\[|\]$/g, "");
    return labels;
  },
  {},
);

const getCustomerName = (customer?: Order["customer"]) =>
  `${customer?.firstName ?? ""} ${customer?.lastName ?? ""}`.trim() || "-";

const getEmployeeName = (employee?: Order["employee"]) =>
  `${employee?.firstName ?? ""} ${employee?.lastName ?? ""}`.trim() ||
  "Chưa xác nhận";

const getOrderTotal = (order: Order) =>
  order.totalMoney ?? (order as Order & { total?: number }).total ?? 0;

export default function SearchOrdersByStatus() {
  const columns: ColumnsType<WithId<Order>> = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      key: "_id",
      width: 120,
      render: (_id: string) => (
        <Typography.Text code title={_id}>
          {_id?.slice(-8).toUpperCase()}
        </Typography.Text>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (customer: Order["customer"]) => {
        return (
          <Typography.Text strong>{getCustomerName(customer)}</Typography.Text>
        );
      },
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "paymentType",
      key: "paymentType",
      width: 160,
      render: (paymentType: string) => <Tag>{paymentType || "-"}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status: string) => (
        <Tag color={statusColors[status] ?? "default"}>
          {statusLabelByValue[status] || status || "-"}
        </Tag>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "employee",
      key: "employee",
      render: (employee: Order["employee"]) => {
        return <Typography.Text>{getEmployeeName(employee)}</Typography.Text>;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalMoney",
      key: "total",
      align: "right",
      width: 160,
      render: (_total, record) => {
        return (
          <Typography.Text strong>
            {numeral(getOrderTotal(record)).format("0,0$")}
          </Typography.Text>
        );
      },
    },
  ];
  const [loading, setLoading] = React.useState(false);
  const [orders, setOrders] = React.useState<WithId<Order>[]>([]);
  const [selectedStatus, setSelectedStatus] = React.useState("");
  const [searchForm] = Form.useForm<{ status: string }>();
  const orderTotal = React.useMemo(
    () => orders.reduce((sum, order) => sum + getOrderTotal(order), 0),
    [orders],
  );

  const onFinish = (values: { status: string }) => {
    setLoading(true);
    axiosClientJson
      .get<GetManyData<WithId<Order>>>(`/orders?status=${values.status}`)
      .then((response) => {
        setOrders(response.data.results);
        setSelectedStatus(values.status);
        setLoading(false);
      })
      .catch(() => {
        message.error("Lỗi!");
        setLoading(false);
      });
  };

  const onFinishFailed: FormProps["onFinishFailed"] = (errors) => {
    devLog("Search orders by status failed", errors);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Typography.Title level={3} className="!mb-1">
              Tìm đơn hàng theo trạng thái
            </Typography.Title>
            <Typography.Text type="secondary">
              Lọc nhanh danh sách đơn hàng và theo dõi tổng giá trị theo từng
              trạng thái xử lý.
            </Typography.Text>
          </div>
          <Space wrap>
            {selectedStatus && (
              <Tag color={statusColors[selectedStatus] ?? "default"}>
                {statusLabelByValue[selectedStatus]}
              </Tag>
            )}
            <Tag icon={<ShoppingCartOutlined />}>{orders.length} đơn hàng</Tag>
          </Space>
        </div>

        <Card bordered={false} className="shadow-sm">
          <Form
            form={searchForm}
            name="search-form"
            layout="vertical"
            initialValues={{ status: "" }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="on"
          >
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} md={14} lg={10}>
                <Form.Item
                  className="!mb-0"
                  label="Trạng thái đơn hàng"
                  name="status"
                >
                  <Select
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    options={OrderStatus}
                    suffixIcon={<FilterOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={10} lg={14}>
                <Space wrap className="w-full md:justify-end">
                  <Button
                    size="large"
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SearchOutlined />}
                  >
                    {loading ? "Đang lọc" : "Lọc đơn hàng"}
                  </Button>
                  <Button
                    size="large"
                    icon={<ClearOutlined />}
                    onClick={() => {
                      searchForm.resetFields();
                      setOrders([]);
                      setSelectedStatus("");
                    }}
                  >
                    Xóa lọc
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic title="Số đơn hàng" value={orders.length} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Tổng giá trị"
                value={orderTotal}
                formatter={(value) => numeral(value).format("0,0$")}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Trạng thái đang xem"
                value={
                  selectedStatus ? statusLabelByValue[selectedStatus] : "Tất cả"
                }
              />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} className="shadow-sm">
          <Table
            rowKey="_id"
            dataSource={orders}
            columns={columns}
            loading={loading}
            scroll={{ x: 900 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `${total} đơn hàng`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chọn trạng thái để xem danh sách đơn hàng"
                />
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
}
