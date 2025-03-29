import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Button,
  Divider,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  AppleOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BarChartOutlined,
  DashboardOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [workoutPlanCount, setWorkoutPlanCount] = useState(0);
  const [nutritionPlanCount, setNutritionPlanCount] = useState(0);
  const [supplementCount, setSupplementCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get("/api/users/count");
        setUserCount(usersResponse.data.count);

        const workoutPlansResponse = await axios.get(
          "/api/workout-plans/count"
        );
        setWorkoutPlanCount(workoutPlansResponse.data.count);

        const nutritionPlansResponse = await axios.get(
          "/api/nutrition-plans/count"
        );
        setNutritionPlanCount(nutritionPlansResponse.data.count);

        const supplementsResponse = await axios.get("/api/supplements/count");
        setSupplementCount(supplementsResponse.data.count);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const cardStyles = {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "10px",
    border: "none",
    transition: "all 0.3s ease",
  };

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
          defaultSelectedKeys={["1"]}
          style={{ background: "transparent", borderRight: 0 }}
        >
          <Menu.Item
            key="1"
            icon={<DashboardOutlined style={{ fontSize: "18px" }} />}
          >
            <Link to="/admin">Dashboard</Link>
          </Menu.Item>
          <Menu.Item
            key="2"
            icon={<HeartOutlined style={{ fontSize: "18px" }} />}
          >
            <Link to="/admin/workout-plans">Workout Plans</Link>
          </Menu.Item>
          <Menu.Item
            key="3"
            icon={<AppleOutlined style={{ fontSize: "18px" }} />}
          >
            <Link to="/admin/nutrition-plans">Nutrition Plans</Link>
          </Menu.Item>
          <Menu.Item
            key="4"
            icon={<MedicineBoxOutlined style={{ fontSize: "18px" }} />}
          >
            <Link to="/admin/supplements">Supplements</Link>
          </Menu.Item>
          <Menu.Item
            key="5"
            icon={<UserOutlined style={{ fontSize: "18px" }} />}
          >
            <Link to="/admin/users">Users</Link>
          </Menu.Item>
        </Menu>
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
              Dashboard Overview
            </Title>
          </div>
          <Title
            level={5}
            style={{ margin: 0, paddingRight: "24px", color: "#1890ff" }}
          >
            Admin Panel
          </Title>
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
          <Title level={4} style={{ marginBottom: "24px", color: "#333" }}>
            System Statistics
          </Title>
          <Divider style={{ margin: "16px 0" }} />
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={cardStyles}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title={
                    <Text strong style={{ fontSize: "16px", color: "#555" }}>
                      Total Users
                    </Text>
                  }
                  value={userCount}
                  valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                  prefix={
                    <UserOutlined
                      style={{
                        backgroundColor: "#e6f7ff",
                        padding: "8px",
                        borderRadius: "8px",
                        color: "#1890ff",
                      }}
                    />
                  }
                  suffix={
                    <Text
                      type="secondary"
                      style={{ fontSize: "14px", marginLeft: "4px" }}
                    >
                      accounts
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={cardStyles}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title={
                    <Text strong style={{ fontSize: "16px", color: "#555" }}>
                      Workout Plans
                    </Text>
                  }
                  value={workoutPlanCount}
                  valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
                  prefix={
                    <HeartOutlined
                      style={{
                        backgroundColor: "#f6ffed",
                        padding: "8px",
                        borderRadius: "8px",
                        color: "#52c41a",
                      }}
                    />
                  }
                  suffix={
                    <Text
                      type="secondary"
                      style={{ fontSize: "14px", marginLeft: "4px" }}
                    >
                      plans
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={cardStyles}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title={
                    <Text strong style={{ fontSize: "16px", color: "#555" }}>
                      Nutrition Plans
                    </Text>
                  }
                  value={nutritionPlanCount}
                  valueStyle={{ color: "#fa8c16", fontWeight: "bold" }}
                  prefix={
                    <AppleOutlined
                      style={{
                        backgroundColor: "#fff7e6",
                        padding: "8px",
                        borderRadius: "8px",
                        color: "#fa8c16",
                      }}
                    />
                  }
                  suffix={
                    <Text
                      type="secondary"
                      style={{ fontSize: "14px", marginLeft: "4px" }}
                    >
                      plans
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={cardStyles}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title={
                    <Text strong style={{ fontSize: "16px", color: "#555" }}>
                      Supplements
                    </Text>
                  }
                  value={supplementCount}
                  valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
                  prefix={
                    <MedicineBoxOutlined
                      style={{
                        backgroundColor: "#f9f0ff",
                        padding: "8px",
                        borderRadius: "8px",
                        color: "#722ed1",
                      }}
                    />
                  }
                  suffix={
                    <Text
                      type="secondary"
                      style={{ fontSize: "14px", marginLeft: "4px" }}
                    >
                      items
                    </Text>
                  }
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
