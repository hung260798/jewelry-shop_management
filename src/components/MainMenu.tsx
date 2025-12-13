import {
  CommentOutlined,
  EllipsisOutlined,
  ExportOutlined,
  HomeOutlined,
  OrderedListOutlined,
  SettingOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { useBreadcrumb } from "../hooks/useBreadcrumb";
import { User } from "@repo/utils/types";
import { axiosClientJson } from "@/libraries/axiosClient";
import { ItemType, MenuItemType } from "antd/es/menu/interface";

type User2 = User & { isAdmin: boolean };

const MainMenu = ({ user }: { user: User2 }) => {
  const { addBread } = useBreadcrumb((state) => state);
  const managementMenus = [
    {
      key: "management/categories",
      label: "Danh mục",
    },
    {
      key: "management/suppliers",
      label: "Nguồn cung",
    },
    {
      key: "management/customers",
      label: "Khách hàng",
    },
    {
      key: "management/products",
      label: "Sản phẩm",
    },
    {
      key: "management/collections",
      label: "Bộ sưu tập",
    },
    user?.isAdmin && {
      key: "management/employees",
      label: "Nhân viên",
    },
  ].filter((elem) => typeof elem === "object");
  const items: ItemType<MenuItemType>[] = [
    {
      label: "Thống kê",
      key: "dashboard",
      icon: <HomeOutlined />,
      children: [
        {
          key: "dashboard/home",
          label: "Thống kê doanh thu",
        },
      ],
    },
    {
      label: "Quản lí",
      key: "management",
      icon: <SettingOutlined />,
      children: managementMenus,
    },
    {
      label: "Đơn hàng",
      key: "order",
      icon: <OrderedListOutlined />,
      children: [
        {
          key: "order/orders",
          label: "Danh sách đơn hàng",
        },
        {
          key: "order/status",
          label: "Lọc theo trạng thái",
        },
      ],
    },
    {
      label: "Khác",
      key: "function",
      icon: <EllipsisOutlined />,
      children: [
        {
          key: "function/slides",
          label: "Slides",
        },
        {
          key: "function/features",
          label: "Tính năng",
        },
      ],
    },
    {
      label: "Tài khoản",
      key: "/account",
      icon: <UsergroupAddOutlined />,
      children: [
        {
          key: "account/information",
          label: "Thông tin",
          icon: <UserOutlined />,
        },
        {
          key: "account/message",
          label: "Trò chuyện",
          icon: <CommentOutlined />,
        },
        {
          key: "account/logout",
          label: "Đăng xuất",
          icon: <ExportOutlined />,
          // render: () => {},
        },
      ],
    },
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuthStore((s) => s.auth);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = async () => {
    try {
      if (auth?.user) {
        await axiosClientJson.patch(`/employees/${auth.user._id}`, {
          lastActivity: new Date(),
        });
      }
    } catch (error) {
      console.error(error);
    }
    localStorage.clear();
    // window.location.href = "/";
    setAuth(null);
  };
  const selectedKey =
    location.pathname === "/"
      ? "dashboard/home"
      : location.pathname.split("/").slice(1).join("/"); // Select "dashboard/home" if path is "/"

  const openKey =
    location.pathname === "/" ? "dashboard" : location.pathname.split("/")[1]; // Open "dashboard" if path is "/"

  const onMenuClick: Parameters<typeof Menu>[0]["onClick"] = (value) => {
    addBread(value.key);
    if (value.key === "account/logout") {
      logout();
      navigate("/", {
        viewTransition: false,
      });
    } else {
      navigate("/" + value.key, {
        viewTransition: false,
      });
      // return redirect("/" + value.key);
    }
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      // defaultSelectedKeys={["dashboard/home"]}
      selectedKeys={[selectedKey]} // Select the appropriate key based on the URL
      // defaultOpenKeys={[openKey]} // Expand only the menu matching the URL or "dashboard" for "/"
      items={items}
      onClick={(e) => onMenuClick(e)}
    />
  );
};

export default MainMenu;
