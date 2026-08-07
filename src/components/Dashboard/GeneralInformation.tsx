import usePopupMessage from "@/hooks/usePopupMessage";
import { axiosClientJson } from "@/libraries/axiosClient";
import { Bar, BarConfig, Column, ColumnConfig } from "@ant-design/plots";
import { Card, Col, DatePicker, Empty, Row, Spin } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import { useEffect, useState } from "react";
import { API_URL } from "utils/constants/URLS";

const MonthlyRevenueInfo = () => {
  const [year, setYear] = useState(moment().year());
  const [loading, setLoading] = useState(false);
  const [monthlyRevenues, setMonthlyRevenues] =
    useState<{ month: unknown; revenue: number }[]>();
  const [messageApi, , key] = usePopupMessage() || [];

  useEffect(() => {
    setLoading(true);
    axiosClientJson
      .get(`${API_URL}/questions/23b`, {
        params: { year: year },
      })
      .then((res) => {
        setMonthlyRevenues(res.data);
      })
      .catch((error) => {
        // messageApi?.error(error.message);
        if (messageApi && key) {
          messageApi.open({ content: error.message, key, type: "error" });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_URL, year]);
  let monthlyRevenuesData: { month: string; revenue: number }[] = [];
  if (monthlyRevenues && monthlyRevenues.length) {
    monthlyRevenuesData = monthlyRevenues.map((item) => ({
      month: `${item.month}`,
      revenue: item.revenue,
    }));
  }
  const monthlyRevenuesConfig: ColumnConfig = {
    data: monthlyRevenuesData,
    xField: "month",
    yField: "revenue",
    seriesField: "month",
    color: "#2563eb",
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
          fill: "#475569",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "#475569",
          line: [4, 4],
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#e2e8f0",
            lineDash: [4, 4],
          },
        },
      },
    },
    yAxis: {
      title: {
        text: "Doanh thu ",
        style: {
          fill: "#475569",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "#475569",
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
            stroke: "#e2e8f0",
            lineDash: [4, 4],
          },
        },
      },
    },
    columnStyle: {
      radius: [5, 5, 5, 5],
    },
  };

  return (
    <Col xs={24} xl={10}>
      <Card
        className="dashboard-card dashboard-chart-card"
        title={"Doanh thu trong năm"}
        variant="borderless"
        extra={
          <DatePicker
            onChange={(value) => {
              if (value) {
                const year = value.year();
                setYear(year);
              }
            }}
            picker="year"
            value={year ? dayjs().year(year) : undefined}
          />
        }
      >
        <div className="dashboard-chart-surface">
          <Spin spinning={loading}>
            {monthlyRevenuesData.length ? (
              <Column {...monthlyRevenuesConfig} />
            ) : (
              <Empty description="Chưa có dữ liệu doanh thu" />
            )}
          </Spin>
        </div>
      </Card>
    </Col>
  );
};

const TopEmployeesInfo = () => {
  const [year, setYear] = useState<number>(moment().year());
  const [loading, setLoading] = useState(false);
  const [topEmployees, setTopEmployees] = useState<
    {
      firstName: string;
      lastName: string;
      total: unknown;
      month: unknown;
    }[]
  >();
  const [messageApi, , key] = usePopupMessage() || [];

  useEffect(() => {
    setLoading(true);
    axiosClientJson
      .get(`${API_URL}/questions/27b`, {
        params: { year: year },
      })
      .then((res) => {
        setTopEmployees(res.data);
      })
      .catch((error) => {
        // messageApi?.error(error.message);
        if (messageApi && key) {
          messageApi.open({ content: error.message, key, type: "error" });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_URL, year]);

  let topEmployeesData: { name: string; revenue: unknown; month: unknown }[] =
    [];
  if (topEmployees && topEmployees.length) {
    topEmployeesData = topEmployees.map((item) => ({
      name: `${item.firstName} ${item.lastName} `,
      revenue: item.total,
      month: item.month,
    }));
  }
  const config: BarConfig = {
    data: topEmployeesData,
    xField: "revenue",
    yField: "name",
    color: "#0f766e",
    xAxis: {
      title: {
        text: "Doanh thu",
        style: {
          fill: "#475569",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "#475569",
          line: [4, 4],
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
            stroke: "#e2e8f0",
            lineDash: [4, 2],
          },
        },
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
          fill: "#475569",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "#475569",
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#e2e8f0",
            lineDash: [4, 4],
          },
        },
      },
    },
    // columnStyle: {
    //   radius: [10, 10, 10, 10],
    // },
  };
  return (
    <Col xs={24} xl={14}>
      {/* {contextHolder} */}
      <Card
        className="dashboard-card dashboard-chart-card"
        title={`Top nhân viên bán hàng xuất sắc trong năm`}
        variant="borderless"
        extra={
          <DatePicker
            onChange={(value) => {
              if (value) {
                const year = value.year();
                setYear(year);
              }
            }}
            picker="year"
            value={year ? dayjs().year(year) : undefined}
          />
        }
      >
        <div className="dashboard-chart-surface">
          <Spin spinning={loading}>
            {topEmployeesData.length ? (
              <Bar {...config} />
            ) : (
              <Empty description="Chưa có dữ liệu nhân viên" />
            )}
          </Spin>
        </div>
      </Card>
    </Col>
  );
};

const GeneralInformation = () => {
  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">Tổng quát</h2>
        <span className="dashboard-section-note">
          Doanh thu và hiệu suất bán hàng
        </span>
      </div>
      <Row gutter={[{ xs: 10, sm: 14, md: 18, lg: 20 }, 20]}>
        <MonthlyRevenueInfo />
        <TopEmployeesInfo />
      </Row>
    </div>
  );
};

export default GeneralInformation;
