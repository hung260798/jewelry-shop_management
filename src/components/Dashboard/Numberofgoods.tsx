import { Pie } from "@ant-design/plots";
import { Card, Col, Divider, Row } from "antd";
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
    label: {
      type: "inner",
      content: "{value}",
      style: {
        textAlign: "center",
        fontSize: 14,
        fontColor: "red",
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
    label: {
      type: "inner",
      content: "{value}",
      style: {
        textAlign: "center",
        fontSize: 14,
        fontColor: "red",
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
    <div>
      <Divider orientation="left">Number of goods</Divider>
      <Card>
        <Row className="px-1">
          <Col xs={24} xl={12}>
            <Card
              type="inner"
              title={"Số lượng hàng hóa trên mỗi danh mục"}
              variant="borderless"
            >
              <Pie {...config} />
            </Card>{" "}
          </Col>
          <Col xs={24} xl={12}>
            <Card
              type="inner"
              title={"Số lượng hàng hóa trên mỗi nhà cung cấp"}
            >
              <Pie {...config2} />
            </Card>{" "}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Numberofgoods;
