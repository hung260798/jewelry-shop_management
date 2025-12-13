import AppSearch from "@/components/AppSearch";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { QueryClientProvider } from "@tanstack/react-query";
import { Button, Flex, Layout, message, Spin } from "antd";
import Avatar from "antd/es/avatar/Avatar";
import { useAuthStore } from "hooks/useAuthStore";
import numeral from "numeral";
import "numeral/locales/vi";
import React, { memo, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { API_URL } from "utils/constants/URLS";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";
import Error from "./components/Placeholders/Error";
import MainMenu from "./components/MainMenu";
import { useMyPrefetch } from "./hooks/useMyQuery";
import { queryClient } from "./libraries/react-query";
import Information from "./pages/Account/Information";
import MessagesDev from "./pages/Account/Messages/MessagesDev";
import Login from "./pages/Auth/Login";
import HomePage from "./pages/HomePage";
import CategoryCRUD from "./pages/Management/CategoryCRUD";
import CollectionCRUD from "./pages/Management/CollectionCRUD";
import CustomerCRUD from "./pages/Management/CustomerCRUD";
import EmployeesCRUD from "./pages/Management/EmployeesCRUD";
import FeaturesCRUD from "./pages/Management/FeaturesCRUD";
import ProductCRUD from "./pages/Management/ProductsCRUD";
import SlidesCRUD from "./pages/Management/SlideCRUD";
import SuppliersCRUD from "./pages/Management/SuppliersCRUD";
import UpdatePage from "./pages/Management/UpdatePage";
import NotFoundPage from "./pages/NotFoundPage";
import Orders from "./pages/Order/Orders";
import SearchOrdersByStatus from "./pages/Order/SearchOrdersByStatus";
import CKEditorPage from "./CKEditor";

numeral.locale("vi");

const MemoSearchBox = memo(AppSearch);

const App: React.FC = () => {
  return (
    <ErrorBoundary fallback={<div>Something went wrong!</div>}>
      <QueryClientProvider client={queryClient}>
        <InnerApp />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

const InnerApp = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const auth = useAuthStore((s) => s.auth);
  const user = auth?.user;

  const [finishedLoading, setFinishedLoading] = useState(false);
  const isSmallScreen = windowWidth < 768;

  useEffect(() => {
    document.title = "Management Website";
    if (auth) {
      if (auth.user) {
        prefetch();
      }
    } else {
      message.info("Please login!!", 1.5);
    }
    setFinishedLoading(true);
  }, [auth]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isSmallScreen && !collapsed) {
      setCollapsed(true);
    }
  }, [isSmallScreen]);

  const [collapsed, setCollapsed] = useState(false);
  // const {
  //   token: { colorBgContainer },
  // } = theme.useToken();

  const { prefetch } = useMyPrefetch();

  let innerContent = null;

  if (!finishedLoading) {
    return (
      <div className="flex justify-center items-center min-h-[100vh]">
        <Spin />
      </div>
    );
  }

  if (!user?._id) {
    innerContent = (
      <Layout.Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout.Content>
    );
  } else {
    const aside = (
      <Layout.Sider
        collapsedWidth={isSmallScreen ? 0 : 100}
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{
          overflow: "auto",
          minHeight: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          // position: "relative",
          minWidth: "300px",
          zIndex: 1000,
        }}
        breakpoint="lg"
        onCollapse={(value) => setCollapsed(value)}
        width={300}
      >
        <Flex
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1001,
            display: collapsed ? "none" : "flex",
            backgroundColor: "#001529",
            width: 300,
          }}
          justify="center"
        >
          <div
            style={{
              // height: 32,
              margin: 16,
              background: "rgba(255, 255, 255, 0.2)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: "1.1rem",
              padding: "0 10px",
            }}
          >
            {!collapsed
              ? `Xin chào, ${user.firstName} ${user.lastName}`
              : undefined}
          </div>
          {isSmallScreen && (
            <Flex
              justify="center"
              align="center"
              // style={{ width: "100%", height: "3rem" }}
            >
              <Button
                type="text"
                // icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                  color: "#fff",
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </Button>
            </Flex>
          )}
        </Flex>
        {/* <div style={{ height: 48 }}></div> */}
        <MainMenu user={user} />
      </Layout.Sider>
    );

    const mainPart = (
      <Layout.Content
        style={{
          minHeight: "100vh",
          overflow: "hidden",
          marginLeft: isSmallScreen ? 0 : collapsed ? "100px" : "300px",
        }}
        className={"mainLayout"}
      >
        <div
          style={{
            padding: 0,
            background: "transparent",
          }}
        >
          <div className="flex items-center">
            <div>
              <Button
                type="text"
                // icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </Button>
            </div>
            <div className="grow flex flex-col justify-center items-center">
              <div className="w-full justify-center items-center">
                <div className={!isSmallScreen ? `px-5` : "px-1"}>
                  <MemoSearchBox />
                </div>
              </div>
            </div>
            {!isSmallScreen && (
              <div className="flex items-center gap-[8px] ml-0 cursor-pointer hover:bg-slate-200 rounded-2xl px-3">
                <Avatar src={`${API_URL}${user.imageUrl}`} size={44} />
              </div>
            )}
          </div>
        </div>
        <ErrorBoundary fallback={<Error />}>
          <Layout.Content className="mx-0 my-0 px-2 py-2">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="dashboard/home" element={<HomePage />} />
              {user.isAdmin && (
                <Route
                  path="/management/employees"
                  element={<EmployeesCRUD />}
                />
              )}
              <Route path="/management/products" element={<ProductCRUD />} />
              <Route path="/function/slides" element={<SlidesCRUD />} />
              <Route path="/function/features" element={<FeaturesCRUD />} />
              <Route path="/management/suppliers" element={<SuppliersCRUD />} />
              <Route path="/management/categories" element={<CategoryCRUD />} />
              <Route path="/management/customers" element={<CustomerCRUD />} />
              <Route
                path="/management/collections"
                element={<CollectionCRUD />}
              />
              <Route path="/order/orders" element={<Orders />} />
              <Route path="/order/status" element={<SearchOrdersByStatus />} />
              <Route path="/account/information" element={<Information />} />
              <Route path="/account/message" element={<MessagesDev />} />
              <Route path="/general-update" element={<UpdatePage />} />
              <Route path="/ckeditor" element={<CKEditorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout.Content>
        </ErrorBoundary>
      </Layout.Content>
    );

    innerContent = (
      <Layout>
        {aside}
        {mainPart}
      </Layout>
    );
  }

  return <BrowserRouter>{innerContent}</BrowserRouter>;
};
