import React from "react";
import { Layout, Avatar, Dropdown, Space, Button, message } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

const AdminHeader = ({ adminInfo }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("userId");
    sessionStorage.removeItem("token");

    message.success("Logged out successfully");
    navigate("/login");
  };

  const items = [
    {
      key: "1",
      label: "Profile Settings",
      icon: <SettingOutlined />,
      onClick: () => navigate("/user/profile"),
    },
    {
      key: "2",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      className="flex justify-between items-center bg-white px-4 shadow-sm"
      style={{ padding: "0 20px" }}
    >
      <h2 className="text-lg font-medium">Admin Control Panel</h2>
      <div>
        <Dropdown menu={{ items }} placement="bottomRight">
          <Button type="text">
            <Space>
              <Avatar icon={<UserOutlined />} />
              {adminInfo?.user_name || "Admin"}
            </Space>
          </Button>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AdminHeader;
