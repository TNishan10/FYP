import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  FileOutlined,
  LineChartOutlined,
  AppleOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const AdminSidebar = ({ selectedKey }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="bg-blue-800"
      style={{
        overflow: "auto",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      <div className="py-5 flex items-center justify-center">
        <Link to="/">
          <h1
            className={`text-white ${
              collapsed ? "text-sm" : "text-2xl"
            } font-bold transition-all`}
          >
            {collapsed ? "OX" : "OX-Fit Admin"}
          </h1>
        </Link>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        className="bg-blue-800"
        items={[
          {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: <Link to="/admin">Dashboard</Link>,
          },
          {
            key: "users",
            icon: <UserOutlined />,
            label: <Link to="/admin/users">Users</Link>,
          },
          {
            key: "plans",
            icon: <FileOutlined />,
            label: <Link to="/admin/plans">Workout Plans</Link>,
          },
          {
            key: "progress",
            icon: <LineChartOutlined />,
            label: <Link to="/admin/progress">Progress Tracking</Link>,
          },
          {
            key: "nutrition",
            icon: <AppleOutlined />,
            label: <Link to="/admin/nutrition">Nutrition Plans</Link>,
          },
          {
            key: "supplements",
            icon: <MedicineBoxOutlined />,
            label: <Link to="/admin/supplements">Supplements</Link>,
          },
        ]}
      />
    </Sider>
  );
};

export default AdminSidebar;
