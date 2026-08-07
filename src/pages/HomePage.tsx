import GeneralInformation from "@/components/Dashboard/GeneralInformation";
import Address from "@/components/Dashboard/GoogleMap";
import Numberofgoods from "@/components/Dashboard/Numberofgoods";
import YearInformation from "@/components/Dashboard/YearInformation";
import "@/components/Dashboard/dashboard.css";

const HomePage = () => {
  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">Dashboard</p>
            <h1 className="dashboard-title">Tổng quan vận hành</h1>
            <p className="dashboard-subtitle">
              Theo dõi doanh thu, đơn hàng, khách hàng và phân bố sản phẩm trong
              một màn hình gọn để ra quyết định nhanh hơn.
            </p>
          </div>
          <div className="dashboard-date">{today}</div>
        </div>
        <YearInformation />
        <GeneralInformation />
        <Numberofgoods />
        <Address />
      </div>
    </div>
  );
};

export default HomePage;
