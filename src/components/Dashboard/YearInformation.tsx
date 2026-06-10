import {
  AppstoreOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Divider, Row, Space, Statistic } from "antd";
import { valueType } from "antd/es/statistic/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { API_URL } from "@/utils/constants/URLS";
import { axiosClientJson } from "@/libraries/axiosClient";

const YearInformation = () => {
  const formatter = (value: string | number) => (
    <CountUp end={+value} separator="," />
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
  return (
    <div>
      <Divider orientation="left">Thống kê trong năm</Divider>
      <Row
        gutter={[
          { xs: 8, sm: 16, md: 24, lg: 32 },
          { xs: 8, sm: 8, lg: 8, xxl: 8 },
        ]}
      >
        <Col xs={24} lg={12} xxl={6}>
          <Card variant="borderless" style={{ width: "100%" }}>
            <div className="d-flex justify-content-between">
              <div className="content">
                <Space>
                  <Statistic
                    prefix={`VNĐ`}
                    title="Year's Sale"
                    value={orderTotal?.total}
                    formatter={formatter}
                    style={{ fontWeight: "bold", overflow: "hidden" }}
                  />
                </Space>
              </div>
              <Button
                icon={
                  <DollarOutlined
                    style={{ fontSize: "24px", color: "white" }}
                  />
                }
                style={{ height: 60, width: 60, backgroundColor: "#1890ff" }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12} xxl={6}>
          <Card bordered={false} style={{ width: "100%" }}>
            <div className="d-flex justify-content-between">
              <div className="content">
                <Space>
                  <Statistic
                    title="Order's total"
                    value={ordersCount}
                    formatter={formatter}
                    style={{ fontWeight: "bold" }}
                  />
                </Space>
              </div>
              <Button
                icon={
                  <ShoppingCartOutlined
                    style={{ fontSize: "24px", color: "white" }}
                  />
                }
                style={{ height: 60, width: 60, backgroundColor: "#1890ff" }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12} xxl={6}>
          <Card bordered={false} style={{ width: "100%" }}>
            <div className="d-flex justify-content-between">
              <div className="content">
                <Space>
                  <Statistic
                    title="Customer's total"
                    value={totalUser}
                    formatter={formatter}
                    style={{ fontWeight: "bold" }}
                  />
                </Space>
              </div>
              <Button
                icon={
                  <UserOutlined style={{ fontSize: "24px", color: "white" }} />
                }
                style={{ height: 60, width: 60, backgroundColor: "#1890ff" }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12} xxl={6}>
          <Card bordered={false} style={{ width: "100%" }}>
            <div className="d-flex justify-content-between">
              <div className="content">
                <Space>
                  <Statistic
                    title="Product's active"
                    value={productsActiveCount}
                    formatter={formatter}
                    style={{ fontWeight: "bold" }}
                  />
                </Space>
              </div>
              <Button
                icon={
                  <AppstoreOutlined
                    style={{ fontSize: "24px", color: "white" }}
                  />
                }
                style={{ height: 60, width: 60, backgroundColor: "#1890ff" }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default YearInformation;
