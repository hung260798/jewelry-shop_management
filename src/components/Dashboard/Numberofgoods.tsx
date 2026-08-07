import { Pie } from "@ant-design/plots";
import { Card, Col, Empty, Row } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL as URL_ENV } from "../../utils/constants/URLS";

type Goods = {
  numberOfProducts: number;
  name: string;
  [k: string]: string | number | never;
};

const Numberofgoods = () => {
  const [totalCategory, setTotalCategory] = useState<Goods[]>();
  const [totalSupplier, setTotalSupplier] = useState<Goods[]>();
  useEffect(() => {
    axios.get(`${URL_ENV}/questions/18`).then((res) => {
      setTotalCategory(res.data);
    });
    axios.get(`${URL_ENV}/questions/19`).then((res) => {
      setTotalSupplier(res.data);
    });
  }, [URL_ENV]);
  let data: Goods[] = [];
  if (totalCategory && totalCategory.length) {
    data = totalCategory.map((item) => ({
      numberOfProducts: item.numberOfProducts,
      name: `${item.name}`,
    }));
  }

  const config = {
    appendPadding: 10,
    data: data,
    angleField: "numberOfProducts",
    colorField: "name",
    radius: 1,
    innerRadius: 0.6,
    color: ["#2563eb", "#0f766e", "#ea580c", "#7c3aed", "#dc2626", "#64748b"],
    label: {
      type: "inner",
      content: "{value}",
      style: {
        textAlign: "center",
        fontSize: 14,
        fill: "#fff",
        fontWeight: 700,
      },
    },

    statistic: {
      content: {
        style: {
          whiteSpace: "pre-wrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      },
    },
  };

  let data2: Goods[] = [];
  if (totalSupplier && totalSupplier.length) {
    data2 = totalSupplier.map((item) => ({
      numberOfProducts: item.numberOfProducts,
      name: `${item.name}`,
    }));
  }

  const config2 = {
    appendPadding: 10,
    data: data2,
    angleField: "numberOfProducts",
    colorField: "name",
    radius: 1,
    innerRadius: 0.6,
    color: ["#0f766e", "#2563eb", "#7c3aed", "#ea580c", "#dc2626", "#64748b"],
    label: {
      type: "inner",
      content: "{value}",
      style: {
        textAlign: "center",
        fontSize: 14,
        fill: "#fff",
        fontWeight: 700,
      },
    },

    statistic: {
      content: {
        style: {
          whiteSpace: "pre-wrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      },
    },
  };

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">Số lượng hàng hóa</h2>
        <span className="dashboard-section-note">Phân bố sản phẩm theo nhóm</span>
      </div>
      <Row gutter={[{ xs: 10, sm: 14, md: 18, lg: 20 }, 20]}>
        <Col xs={24} xl={12}>
          <Card
            className="dashboard-card dashboard-chart-card"
            title={"Theo danh mục"}
            variant="borderless">
            <div className="dashboard-chart-surface">
              {data.length ? (
                <Pie {...config} />
              ) : (
                <Empty description="Chưa có dữ liệu danh mục" />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            className="dashboard-card dashboard-chart-card"
            title={"Theo nhà cung cấp"}
            variant="borderless">
            <div className="dashboard-chart-surface">
              {data2.length ? (
                <Pie {...config2} />
              ) : (
                <Empty description="Chưa có dữ liệu nhà cung cấp" />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Numberofgoods;
