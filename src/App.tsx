import AppSearch from "@/components/AppSearch";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { QueryClientProvider } from "@tanstack/react-query";
import { Button, Flex, Layout, message, Space, Spin } from "antd";
import Avatar from "antd/es/avatar/Avatar";
import { useAuthStore, useUser } from "hooks/stores/useAuthStore";
import numeral from "numeral";
import "numeral/locales/vi";
import React, { memo, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ASSET_URL } from "utils/constants/URLS";
import "./App.css";
import CKEditorPage from "./CKEditor";
import ErrorBoundary from "./components/ErrorBoundary";
import MainMenu from "./components/MainMenu";
import Error from "./components/Placeholders/Error";
import { useMyPrefetch } from "./hooks/useMyQuery";
import useWindowWidth from "./hooks/useWidth";
import { queryClient } from "./libraries/react-query";
import Information from "./pages/Account/Information";
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
import { appendDomain } from "./utils/stringUtils";

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
  const windowWidth = useWindowWidth();
  const authUser = useUser();
  const loading = useAuthStore((s) => s.loading);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isSmallScreen = windowWidth < 768;

  useEffect(() => {
    if (authUser) {
      setLoading(true);
      prefetch().finally(() => setLoading(false));
    } else {
      message.info("Please login!!", 1.5);
    }
  }, [authUser]);

  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (isSmallScreen && !collapsed) {
      setCollapsed(true);
    }
  }, [isSmallScreen]);

  // const {
  //   token: { colorBgContainer },
  // } = theme.useToken();

  const { prefetch } = useMyPrefetch();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!authUser?._id) {
    return (
      <BrowserRouter>
        <Layout.Content style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout.Content>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
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
          width={300}>
          <Flex
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1001,
              // display: collapsed ? "none" : "flex",
              display: "flex",
              backgroundColor: "#001529",
              width: collapsed ? 100 : 300,
            }}
            justify="center">
            <div
              style={{
                // height: 32,
                margin: 16,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontSize: "1.1rem",
                padding: "0 10px",
              }}>
              {!collapsed ? (
                <>
                  <Space>
                    <Avatar
                      src={appendDomain(authUser.imageUrl || "", ASSET_URL)}
                      size={44}
                    />
                    {`${authUser.firstName} ${authUser.lastName}`}
                  </Space>
                </>
              ) : (
                <Avatar
                  src={appendDomain(authUser.imageUrl || "", ASSET_URL)}
                  size={44}
                />
              )}
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
                  }}>
                  {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </Button>
              </Flex>
            )}
          </Flex>
          {/* <div style={{ height: 48 }}></div> */}
          <MainMenu user={authUser} />
        </Layout.Sider>
        <Layout.Content
          style={{
            minHeight: "100vh",
            overflow: "hidden",
            marginLeft: isSmallScreen ? 0 : collapsed ? "100px" : "300px",
          }}
          className={"mainLayout"}>
          <div
            style={{
              padding: 0,
              background: "transparent",
            }}>
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
                  }}>
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
            </div>
          </div>
          <ErrorBoundary fallback={<Error />}>
            <Layout.Content className="mx-0 my-0 px-2 py-2">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="dashboard/home" element={<HomePage />} />
                {authUser.isAdmin && (
                  <Route
                    path="/management/employees"
                    element={<EmployeesCRUD />}
                  />
                )}
                <Route path="/management/products" element={<ProductCRUD />} />
                <Route path="/function/slides" element={<SlidesCRUD />} />
                <Route path="/function/features" element={<FeaturesCRUD />} />
                <Route
                  path="/management/suppliers"
                  element={<SuppliersCRUD />}
                />
                <Route
                  path="/management/categories"
                  element={<CategoryCRUD />}
                />
                <Route
                  path="/management/customers"
                  element={<CustomerCRUD />}
                />
                <Route
                  path="/management/collections"
                  element={<CollectionCRUD />}
                />
                <Route path="/order/orders" element={<Orders />} />
                <Route
                  path="/order/status"
                  element={<SearchOrdersByStatus />}
                />
                <Route path="/account/information" element={<Information />} />
                <Route path="/general-update" element={<UpdatePage />} />
                <Route path="/ckeditor" element={<CKEditorPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              {/* <div className="w-72">
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div> */}
            </Layout.Content>
          </ErrorBoundary>
        </Layout.Content>
      </Layout>
    </BrowserRouter>
  );
};
