import {
  AppstoreOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";
import { valueType } from "antd/es/statistic/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { API_URL } from "@/utils/constants/URLS";
import { axiosClientJson } from "@/libraries/axiosClient";

const YearInformation = () => {
  const formatter = (value?: valueType) => (
    <CountUp end={Number(value) || 0} separator="," />
  );

  const [orderTotal, setOrderTotal] = useState<{ total: valueType }>();
  const [totalUser, setTotalUser] = useState<valueType>();
  const [ordersCount, setOrdersCount] = useState<valueType>();
  const [productsActiveCount, setProductsActiveCount] = useState<valueType>();
  useEffect(() => {
    axiosClientJson.get(`${API_URL}/questions/23`).then((res) => {
      setOrderTotal(res.data);
    });
    axiosClientJson.get(`${API_URL}/customers`).then((res) => {
      setTotalUser(res.data.amountResults);
    });

    axios.get(`${API_URL}/products?active=true`).then((res) => {
      setProductsActiveCount(res.data.amountResults);
    });
  }, [API_URL]);

  useEffect(() => {
    axiosClientJson.get(`/orders?fields[]=_id`).then((res) => {
      setOrdersCount(res.data.amountResults);
    });
  }, []);

  const metrics = [
    {
      title: "Doanh thu năm",
      value: orderTotal?.total,
      prefix: "VNĐ",
      icon: <DollarOutlined />,
      className: "revenue",
    },
    {
      title: "Tổng đơn hàng",
      value: ordersCount,
      icon: <ShoppingCartOutlined />,
      className: "orders",
    },
    {
      title: "Tổng khách hàng",
      value: totalUser,
      icon: <UserOutlined />,
      className: "customers",
    },
    {
      title: "Sản phẩm đang bán",
      value: productsActiveCount,
      icon: <AppstoreOutlined />,
      className: "products",
    },
  ];

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">Thống kê trong năm</h2>
        <span className="dashboard-section-note">Dữ liệu tổng hợp hiện tại</span>
      </div>
      <Row
        gutter={[
          { xs: 10, sm: 14, md: 18, lg: 20 },
          { xs: 10, sm: 14, md: 18, lg: 20 },
        ]}
      >
        {metrics.map((metric) => (
          <Col xs={24} sm={12} xxl={6} key={metric.title}>
            <Card
              className="dashboard-card dashboard-kpi-card"
              variant="borderless"
            >
              <div className="dashboard-kpi-body">
                <Statistic
                  prefix={metric.prefix}
                  title={metric.title}
                  value={metric.value}
                  formatter={formatter}
                  valueStyle={{
                    color: "#0f172a",
                    fontSize: 28,
                    fontWeight: 800,
                    lineHeight: 1.15,
                  }}
                />
                <div className={`dashboard-kpi-icon ${metric.className}`}>
                  {metric.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default YearInformation;
