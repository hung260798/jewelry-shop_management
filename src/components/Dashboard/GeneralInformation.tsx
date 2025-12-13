import { Bar, BarConfig, Column, ColumnConfig } from "@ant-design/plots";
import { Card, Col, DatePicker, DatePickerProps, Divider, Row } from "antd";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { API_URL } from "utils/constants/URLS";

const GeneralInformation = () => {
  const [getYearRevenue, setGetYearRevenue] = useState(moment().year());
  const [getYearTopEmployee, setGetYearTopEmployee] = useState<number>(
    moment().year()
  );
  const [totalMonth, setTotalMonth] =
    useState<{ month: unknown; revenue: number }[]>();
  const [lineData, setLineData] = useState<
    {
      firstName: unknown;
      lastName: unknown;
      total: unknown;
      month: unknown;
    }[]
  >();
  useEffect(() => {
    axios
      .post(`${API_URL}/questions/23b`, { year: getYearRevenue })
      .then((res) => {
        setTotalMonth(res.data);
      });
  }, [API_URL, getYearRevenue]);
  useEffect(() => {
    axios
      .post(`${API_URL}/questions/27b`, { year: getYearTopEmployee })
      .then((res) => {
        setLineData(res.data);
      });
  }, [API_URL, getYearTopEmployee]);
  let data: { month: unknown; revenue: number }[] = [];
  if (totalMonth && totalMonth.length) {
    data = totalMonth.map((item) => ({
      month: `${item.month}`,
      revenue: item.revenue,
    }));
  }
  const handlePickYearRevenue: DatePickerProps["onChange"] = (value) => {
    if (value) {
      const year = value.year();
      setGetYearRevenue(year);
    }
  };
  const handlePickYearTopEmployee: DatePickerProps["onChange"] = (value) => {
    if (value) {
      const year = value.year();
      setGetYearTopEmployee(year);
    }
  };
  const config: ColumnConfig = {
    data: data,
    xField: "month",
    yField: "revenue",
    seriesField: "month",
    color: `white`,
    tooltip: {
      customContent: (title, items) => {
        const formattedItems = items.map((item) => {
          const formattedValue = item.value
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          let name = item.name;
          if (name) {
            name = name.split(":")[1]?.trim(); // Extract the text after the colon and remove leading/trailing spaces
          }
          return ` ${formattedValue}`;
        });
        return `<div> Tháng ${title} :</div><div>${formattedItems.join(
          "<br/>"
        )} VND</div>`;
      },
    },
    xAxis: {
      title: {
        text: "Tháng",
        style: {
          fill: "white",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "white",
          line: [4, 4],
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#ddd",
            lineDash: [4, 4],
          },
        },
        alternateColor: "rgba(0,0,0,0.05)",
      },
    },
    yAxis: {
      title: {
        text: "Doanh thu ",
        style: {
          fill: "white",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "white", // Change the color of yField label to blue
        },
        formatter: (value) => {
          const formattedPrice = value
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          const data = `${formattedPrice}đ`;
          return data;
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#ddd",
            lineDash: [4, 4],
          },
        },
        alternateColor: "rgba(0,0,0,0.05)",
      },
    },
    columnStyle: {
      radius: [5, 5, 5, 5],
    },
  };
  let data2: { name: string; revenue: unknown; month: unknown }[] = [];
  if (lineData && lineData.length) {
    data2 = lineData.map((item) => ({
      name: `${item.firstName} ${item.lastName} `,
      revenue: item.total,
      month: item.month,
    }));
  }
  const config2: BarConfig = {
    data: data2,
    xField: "revenue",
    yField: "name",
    color: "white",
    xAxis: {
      title: {
        text: "Doanh thu",
        style: {
          fill: "white",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "white", // Change the color of xField label to red
          line: [4, 4], // This creates a dashed line effect
        },
        formatter: (value) => {
          const formattedPrice = value
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          const data = `${formattedPrice}đ`;
          return data;
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#ddd",
            lineDash: [4, 2],
          },
        },
        alternateColor: "rgba(0,0,0,0.05)",
      },
    },
    tooltip: {
      customContent: (title, items) => {
        const formattedItems = items.map((item) => {
          const formattedValue = item.value
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          let name = item.name;
          if (name) {
            name = name.split(":")[1]?.trim(); // Extract the text after the colon and remove leading/trailing spaces
          }
          return ` ${formattedValue}`;
        });
        return `<div> Nhân viên ${title} :</div><div>${formattedItems.join(
          "<br/>"
        )} VND</div>`;
      },
    },
    yAxis: {
      title: {
        text: " Nhân viên",
        style: {
          fill: "white",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "white", // Change the color of yField label to blue
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#ddd",
            lineDash: [4, 4],
          },
        },
        alternateColor: "rgba(0,0,0,0.05)",
      },
    },
    // columnStyle: {
    //   radius: [10, 10, 10, 10],
    // },
  };
  return (
    <div>
      <Divider orientation="left">Genaral Information</Divider>
      <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 8]}>
        <Col xs={24} xl={10}>
          <Card
            title={"Doanh thu trong năm"}
            variant="borderless"
            extra={
              <DatePicker onChange={handlePickYearRevenue} picker="year" />
            }
          >
            <div
              className=" px-3 py-3 rounded-0"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#00369e,#005cfd,#a18dff)",
              }}
            >
              <Column className="rounded-4" {...config} />
            </div>
          </Card>{" "}
        </Col>
        <Col xs={24} xl={14}>
          <Card
            title={`Top nhân viên bán hàng xuất sắc trong năm`}
            variant="borderless"
            // style={{ width: "100%" }}
            extra={
              <DatePicker onChange={handlePickYearTopEmployee} picker="year" />
            }
          >
            <div
              className="px-3 py-3"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#435a65,#487d4c,#758831)",
              }}
            >
              <Bar {...config2} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GeneralInformation;
