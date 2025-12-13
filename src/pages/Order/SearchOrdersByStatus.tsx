import { axiosClientJson } from "@/libraries/axiosClient";
import { OrderStatus } from "@/meta/OrderStatus";
import { Button, Form, FormProps, message, Select, Table } from "antd";
import React from "react";
import { Order } from "@/utils/types/Entities";
import { ColumnsType } from "antd/es/table";
import numeral from "numeral";
import { devLog } from "@/utils/logger";

export default function SearchOrdersByStatus() {
  const columns: ColumnsType<Order> = [
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (customer: Order["customer"]) => {
        return (
          <strong>
            {customer?.firstName} {customer?.lastName}
          </strong>
        );
      },
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "paymentType",
      key: "paymentType",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },

    {
      title: "Nhân viên",
      dataIndex: "employee",
      key: "employee",
      render: (employee: Order["employee"]) => {
        return (
          <strong>
            {employee?.firstName} {employee?.lastName}
          </strong>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (text, record) => {
        const { orderDetails } = record;

        let total = 0;
        orderDetails.forEach((od) => {
          total = total + od.quantity * od.product.total;
        });

        return <strong>{numeral(total).format("0,0$")}</strong>;
      },
    },
  ];
  const [loading, setLoading] = React.useState(false);
  const [orders, setOrders] = React.useState([]);
  const [searchForm] = Form.useForm();

  const onFinish = (values: any) => {
    setLoading(true);
    axiosClientJson
      .get(`/orders/questions/7?status=${values.status}`)
      .then((response) => {
        // console.log(response.data);
        setOrders(response.data);
        setLoading(false);
      })
      .catch(() => {
        message.error("Lỗi!");
        setLoading(false);
      });
  };

  const onFinishFailed: FormProps["onFinishFailed"] = (errors) => {
    devLog("🐣", errors);
  };

  return (
    <div>
      <Form
        form={searchForm}
        name="search-form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ status: "" }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="on"
      >
        <Form.Item label="Trạng thái đơn hàng" name="status">
          <Select options={OrderStatus} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="dashed" htmlType="submit" loading={loading}>
            {loading ? "Đang xử lý ..." : "Lọc thông tin"}
          </Button>
        </Form.Item>
      </Form>
      <Table rowKey="_id" dataSource={orders} columns={columns} />
    </div>
  );
}
