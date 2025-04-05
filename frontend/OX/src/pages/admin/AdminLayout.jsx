import React, { useState, useEffect } from "react";
import { Layout, Menu, Typography, Button, message } from "antd";
import {
  UserOutlined,
  HeartOutlined,
  AppleOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Determine which menu item should be selected based on path
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/admin") return "1";
    if (path.includes("/admin/workout-plans")) return "2";
    if (path.includes("/admin/nutrition-plans")) return "3";
    if (path.includes("/admin/supplements")) return "4";
    if (path.includes("/admin/users")) return "5";
    return "1"; // Default to dashboard
  };

  useEffect(() => {
    const checkAdminAccess = () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("Please login to access the admin dashboard");
        navigate("/login");
        return;
      }

      try {
        // Decode token to check admin status
        const decodedToken = jwtDecode(token);
        if (!decodedToken.isAdmin) {
          message.error(
            "You don't have permission to access the admin dashboard"
          );
          navigate("/"); // Redirect to home page
        }
      } catch (error) {
        console.error("Error verifying admin status:", error);
        message.error("Authentication error");
        navigate("/login");
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Menu items defined using the new API format
  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined style={{ fontSize: "18px" }} />,
      label: "Dashboard",
      onClick: () => navigate("/admin"),
    },
    {
      key: "2",
      icon: <HeartOutlined style={{ fontSize: "18px" }} />,
      label: "Workout Plans",
      onClick: () => navigate("/admin/workout-plans"),
    },
    {
      key: "3",
      icon: <AppleOutlined style={{ fontSize: "18px" }} />,
      label: "Nutrition Plans",
      onClick: () => navigate("/admin/nutrition-plans"),
    },
    {
      key: "4",
      icon: <MedicineBoxOutlined style={{ fontSize: "18px" }} />,
      label: "Supplements",
      onClick: () => navigate("/admin/supplements"),
    },
    {
      key: "5",
      icon: <UserOutlined style={{ fontSize: "18px" }} />,
      label: "Users",
      onClick: () => navigate("/admin/users"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.15)",
          background: "linear-gradient(180deg, #001529 0%, #003366 100%)",
        }}
      >
        <div
          className="logo"
          style={{
            height: "64px",
            margin: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            letterSpacing: "1px",
          }}
        >
          {collapsed ? "OX" : "OX-Fit Admin"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>

      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: 0,
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "trigger",
                onClick: toggleCollapsed,
                style: {
                  padding: "0 24px",
                  fontSize: "20px",
                  color: "#1890ff",
                },
              }
            )}
            <Title level={4} style={{ margin: 0 }}>
              Admin Panel
            </Title>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              paddingRight: "24px",
            }}
          >
            {/* User email display */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <UserOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
              <Text style={{ color: "#666" }}>
                {sessionStorage.getItem("userEmail") ||
                  localStorage.getItem("userEmail")}
              </Text>
            </div>

            {/* Logout button */}
            <Button
              type="primary"
              danger
              icon={<MdLogout style={{ fontSize: "16px" }} />}
              onClick={() => {
                logout();
                message.success("Logged out successfully");
                setTimeout(() => {
                  navigate("/login");
                }, 1000);
              }}
            >
              Sign Out
            </Button>
          </div>
        </Header>

        <Content
          style={{
            margin: "24px",
            padding: "24px",
            minHeight: 280,
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
