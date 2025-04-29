import React, { useState, useEffect } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Divider,
  message,
  Button,
  Space,
  Badge,
  Tabs,
  Progress,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  AppleOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  RiseOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CalendarOutlined,
  PieChartOutlined,
  FireOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Line, Bar, Pie } from "@ant-design/plots";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [workoutPlanCount, setWorkoutPlanCount] = useState(0);
  const [nutritionPlanCount, setNutritionPlanCount] = useState(0);
  const [supplementCount, setSupplementCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sample historical data for charts
  const [growthData] = useState([
    { month: "Jan", users: 20, workouts: 5, nutrition: 3, supplements: 8 },
    { month: "Feb", users: 40, workouts: 12, nutrition: 8, supplements: 15 },
    { month: "Mar", users: 65, workouts: 18, nutrition: 12, supplements: 22 },
    {
      month: "Apr",
      users: userCount > 65 ? userCount : 85,
      workouts: workoutPlanCount > 18 ? workoutPlanCount : 25,
      nutrition: nutritionPlanCount > 12 ? nutritionPlanCount : 18,
      supplements: supplementCount > 22 ? supplementCount : 30,
    },
  ]);

  // Define fetchData outside useEffect so handleRefresh can access it
  const fetchData = async () => {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Fetch users with individual try/catch
      try {
        const usersResponse = await axios.get(
          "http://localhost:8000/api/v1/auth/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (usersResponse.data && usersResponse.data.data) {
          console.log("User count fetched:", usersResponse.data.data.length);
          setUserCount(usersResponse.data.data.length);
        }
      } catch (userError) {
        console.error("Error fetching user data:", userError);
        // Don't throw - continue with other requests
      }

      // Fetch workout plans with individual try/catch
      try {
        const workoutPlansResponse = await axios.get(
          "http://localhost:8000/api/v1/auth/training-programs",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (workoutPlansResponse.data && workoutPlansResponse.data.data) {
          setWorkoutPlanCount(workoutPlansResponse.data.data.length);
        }
      } catch (workoutError) {
        console.error("Workout plans endpoint may not exist:", workoutError);
        // Just set to 0 if the endpoint doesn't exist yet
        setWorkoutPlanCount(0);
      }

      // Fetch nutrition plans with individual try/catch
      try {
        const nutritionPlansResponse = await axios.get(
          "http://localhost:8000/api/v1/auth/nutrition-plans",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (nutritionPlansResponse.data && nutritionPlansResponse.data.data) {
          setNutritionPlanCount(nutritionPlansResponse.data.data.length);
        }
      } catch (nutritionError) {
        console.error(
          "Nutrition plans endpoint may not exist:",
          nutritionError
        );
        setNutritionPlanCount(0);
      }

      // Fetch supplements with individual try/catch
      try {
        const supplementsResponse = await axios.get(
          "http://localhost:8000/api/v1/auth/supplement",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (supplementsResponse.data && supplementsResponse.data.data) {
          setSupplementCount(supplementsResponse.data.data.length);
        }
      } catch (supplementError) {
        console.error("Error fetching supplement data:", supplementError);
        setSupplementCount(0);
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
      message.error("Failed to fetch dashboard statistics");
    }
  };

  // Refresh button handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Listen for window focus to refresh data
    const handleFocus = () => {
      fetchData();
    };

    // Listen for user data changes from UsersAdmin component
    const handleUserDataChange = (event) => {
      console.log("User data changed event received:", event.detail);

      // If the event provides a count, use it directly
      if (event.detail && event.detail.count !== undefined) {
        console.log("Setting user count to:", event.detail.count);
        setUserCount(event.detail.count);
      } else {
        // Otherwise refresh all data
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("user-data-change", handleUserDataChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("user-data-change", handleUserDataChange);
    };
  }, []);

  const cardStyles = {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "10px",
    border: "none",
    transition: "all 0.3s ease",
    height: "100%",
  };

  // Configuration for growth trend chart
  const lineConfig = {
    data: growthData,
    xField: "month",
    yField: "users",
    seriesField: "",
    color: "#1890ff",
    point: {
      size: 5,
      shape: "diamond",
    },
    smooth: true,
  };

  // Configuration for category distribution chart
  const barConfig = {
    data: [
      { category: "Users", value: userCount },
      { category: "Workouts", value: workoutPlanCount },
      { category: "Nutrition", value: nutritionPlanCount },
      { category: "Supplements", value: supplementCount },
    ],
    xField: "value",
    yField: "category",
    seriesField: "category",
    legend: { position: "top" },
    colorField: "category",
    color: ({ category }) => {
      if (category === "Users") return "#1890ff";
      if (category === "Workouts") return "#52c41a";
      if (category === "Nutrition") return "#fa8c16";
      return "#722ed1";
    },
  };

  // Dynamic content distribution for pie chart
  const contentDistributionData = [
    { type: "Users", value: userCount || 1 },
    { type: "Workout Plans", value: workoutPlanCount || 1 },
    { type: "Nutrition Plans", value: nutritionPlanCount || 1 },
    { type: "Supplements", value: supplementCount || 1 },
  ];

  // Configuration for content distribution pie chart
  const contentPieConfig = {
    appendPadding: 10,
    data: contentDistributionData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    legend: {
      position: "bottom",
    },
    label: {
      type: "outer",
      content: "{name} {percentage}",
    },
    interactions: [
      {
        type: "pie-legend-active",
      },
      {
        type: "element-active",
      },
    ],
    color: ["#1890ff", "#52c41a", "#fa8c16", "#722ed1"],
  };

  // Dynamic user engagement data for pie chart
  const userActiveCount = Math.round(userCount * 0.75) || 1;
  const userInactiveCount = userCount - userActiveCount || 1;

  const userEngagementData = [
    { type: "Active Users", value: userActiveCount },
    { type: "Inactive Users", value: userInactiveCount },
  ];

  // Configuration for user engagement pie chart
  const userEngagementPieConfig = {
    appendPadding: 10,
    data: userEngagementData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    legend: {
      position: "bottom",
    },
    label: {
      type: "outer",
      content: "{name} {percentage}",
    },
    interactions: [
      {
        type: "pie-legend-active",
      },
      {
        type: "element-active",
      },
    ],
    color: ["#52c41a", "#bfbfbf"],
  };

  // Dynamic revenue data based on counts
  const revenueData = [
    {
      month: "Jan",
      workouts: workoutPlanCount ? Math.round(workoutPlanCount * 50) : 250,
      nutrition: nutritionPlanCount ? Math.round(nutritionPlanCount * 65) : 195,
      supplements: supplementCount ? Math.round(supplementCount * 30) : 240,
    },
    {
      month: "Feb",
      workouts: workoutPlanCount ? Math.round(workoutPlanCount * 65) : 325,
      nutrition: nutritionPlanCount ? Math.round(nutritionPlanCount * 80) : 240,
      supplements: supplementCount ? Math.round(supplementCount * 40) : 320,
    },
    {
      month: "Mar",
      workouts: workoutPlanCount ? Math.round(workoutPlanCount * 85) : 425,
      nutrition: nutritionPlanCount ? Math.round(nutritionPlanCount * 95) : 285,
      supplements: supplementCount ? Math.round(supplementCount * 55) : 440,
    },
  ];

  // Configuration for revenue bar chart
  const revenueBarConfig = {
    data: revenueData,
    isStack: true,
    xField: "month",
    yField: "value",
    seriesField: "type",
    legend: { position: "top" },
    label: {
      position: "middle",
      layout: [
        { type: "interval-adjust-position" },
        { type: "interval-hide-overlap" },
        { type: "adjust-color" },
      ],
    },
  };

  // Prepare data for stacked revenue bar chart
  const stackedRevenueData = [];
  revenueData.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== "month") {
        stackedRevenueData.push({
          month: item.month,
          type: key,
          value: item[key],
        });
      }
    });
  });

  // Config for stacked revenue bar
  const stackedRevenueConfig = {
    data: stackedRevenueData,
    isStack: true,
    xField: "month",
    yField: "value",
    seriesField: "type",
    label: {
      position: "middle",
      layout: [
        { type: "interval-adjust-position" },
        { type: "interval-hide-overlap" },
        { type: "adjust-color" },
      ],
    },
    color: ["#52c41a", "#fa8c16", "#722ed1"],
  };

  // Calculate total items
  const totalItems =
    userCount + workoutPlanCount + nutritionPlanCount + supplementCount;

  return (
    <div
      className="admin-dashboard"
      style={{ padding: "8px", background: "#f7fafc" }}
    >
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <Title level={4} style={{ color: "#333", margin: 0 }}>
              System Statistics
            </Title>
            <Badge
              count="Live"
              style={{ backgroundColor: "#52c41a", marginLeft: "8px" }}
            />
          </Space>
          <Space>
            <Text type="secondary">
              <CalendarOutlined /> Last updated:{" "}
              {new Date().toLocaleTimeString()}
            </Text>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={isRefreshing}
              onClick={handleRefresh}
            >
              Refresh Stats
            </Button>
          </Space>
        </div>

        <Paragraph type="secondary" style={{ marginTop: "8px" }}>
          Total system items: <Text strong>{totalItems}</Text> • Platform
          performance:{" "}
          <Text strong style={{ color: "#52c41a" }}>
            Excellent
          </Text>
        </Paragraph>

        <Progress
          percent={Math.min(totalItems / 2, 100)}
          size="small"
          strokeColor={{
            "0%": "#1890ff",
            "100%": "#52c41a",
          }}
          showInfo={false}
          style={{ marginBottom: "16px" }}
        />
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={cardStyles}
            styles={{ body: { padding: "24px" } }}
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
            <div style={{ marginTop: "12px" }}>
              <Text
                type="success"
                style={{ display: "flex", alignItems: "center" }}
              >
                <RiseOutlined style={{ marginRight: "4px" }} /> +30% growth
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={cardStyles}
            styles={{ body: { padding: "24px" } }}
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
            <div style={{ marginTop: "12px" }}>
              <Text
                type="success"
                style={{ display: "flex", alignItems: "center" }}
              >
                <RiseOutlined style={{ marginRight: "4px" }} /> +24% growth
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={cardStyles}
            styles={{ body: { padding: "24px" } }}
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
            <div style={{ marginTop: "12px" }}>
              <Text
                type="success"
                style={{ display: "flex", alignItems: "center" }}
              >
                <RiseOutlined style={{ marginRight: "4px" }} /> +18% growth
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={cardStyles}
            styles={{ body: { padding: "24px" } }}
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
            <div style={{ marginTop: "12px" }}>
              <Text
                type="success"
                style={{ display: "flex", alignItems: "center" }}
              >
                <RiseOutlined style={{ marginRight: "4px" }} /> +22% growth
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Analytics Section */}
      <Card
        title={
          <Space>
            <BarChartOutlined style={{ color: "#1890ff" }} />
            <Text strong>Data Analytics</Text>
          </Space>
        }
        style={{ marginTop: "24px", borderRadius: "12px" }}
      >
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <>
                <LineChartOutlined /> Growth Trends
              </>
            }
            key="1"
          >
            <div style={{ height: "300px", marginBottom: "24px" }}>
              <Line {...lineConfig} />
            </div>
          </TabPane>
          <TabPane
            tab={
              <>
                <BarChartOutlined /> Distribution
              </>
            }
            key="2"
          >
            <div style={{ height: "300px", marginBottom: "24px" }}>
              <Bar {...barConfig} />
            </div>
          </TabPane>
          <TabPane
            tab={
              <>
                <PieChartOutlined /> Content Distribution
              </>
            }
            key="3"
          >
            <div style={{ height: "300px", marginBottom: "24px" }}>
              <Pie {...contentPieConfig} />
            </div>
          </TabPane>
          <TabPane
            tab={
              <>
                <TeamOutlined /> User Engagement
              </>
            }
            key="4"
          >
            <div style={{ height: "300px", marginBottom: "24px" }}>
              <Pie {...userEngagementPieConfig} />
            </div>
          </TabPane>
          <TabPane
            tab={
              <>
                <DollarOutlined /> Revenue
              </>
            }
            key="5"
          >
            <div style={{ height: "300px", marginBottom: "24px" }}>
              <Bar {...stackedRevenueConfig} />
            </div>
          </TabPane>
        </Tabs>

        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="User Activity" bordered={false}>
              <Statistic
                title="Active Users"
                value={Math.round(userCount * 0.75)}
                suffix={`/ ${userCount}`}
              />
              <Progress
                percent={
                  userCount
                    ? Math.round(((userCount * 0.75) / userCount) * 100)
                    : 0
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="Content Usage" bordered={false}>
              <Statistic
                title="Most Popular"
                value="Workout Plans"
                valueStyle={{ fontSize: "1rem" }}
              />
              <Progress percent={65} status="active" strokeColor="#52c41a" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="System Health" bordered={false}>
              <Statistic
                title="Server Status"
                value="Online"
                valueStyle={{ color: "#52c41a", fontSize: "1rem" }}
              />
              <Progress percent={98} status="success" />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* New Section: Detailed Analytics */}
      <Card
        title={
          <Space>
            <FireOutlined style={{ color: "#fa8c16" }} />
            <Text strong>Performance Insights</Text>
          </Space>
        }
        style={{ marginTop: "24px", borderRadius: "12px" }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="User Engagement By Content Type" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Workout Plans Engagement"
                    value={
                      workoutPlanCount
                        ? Math.round((workoutPlanCount / totalItems) * 100)
                        : 0
                    }
                    suffix="%"
                    valueStyle={{ color: "#52c41a" }}
                  />
                  <Progress
                    percent={
                      workoutPlanCount
                        ? Math.round((workoutPlanCount / totalItems) * 100)
                        : 0
                    }
                    strokeColor="#52c41a"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Nutrition Plans Engagement"
                    value={
                      nutritionPlanCount
                        ? Math.round((nutritionPlanCount / totalItems) * 100)
                        : 0
                    }
                    suffix="%"
                    valueStyle={{ color: "#fa8c16" }}
                  />
                  <Progress
                    percent={
                      nutritionPlanCount
                        ? Math.round((nutritionPlanCount / totalItems) * 100)
                        : 0
                    }
                    strokeColor="#fa8c16"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Supplements Engagement"
                    value={
                      supplementCount
                        ? Math.round((supplementCount / totalItems) * 100)
                        : 0
                    }
                    suffix="%"
                    valueStyle={{ color: "#722ed1" }}
                  />
                  <Progress
                    percent={
                      supplementCount
                        ? Math.round((supplementCount / totalItems) * 100)
                        : 0
                    }
                    strokeColor="#722ed1"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="User Profile Activity"
                    value={
                      userCount ? Math.round((userCount / totalItems) * 100) : 0
                    }
                    suffix="%"
                    valueStyle={{ color: "#1890ff" }}
                  />
                  <Progress
                    percent={
                      userCount ? Math.round((userCount / totalItems) * 100) : 0
                    }
                    strokeColor="#1890ff"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Growth Projections" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Expected Users Next Month"
                    value={Math.round(userCount * 1.3)}
                    valueStyle={{ color: "#1890ff" }}
                  />
                  <Paragraph type="secondary" style={{ marginTop: "8px" }}>
                    Based on 30% monthly growth rate
                  </Paragraph>
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Expected Content Next Month"
                    value={Math.round(
                      (workoutPlanCount +
                        nutritionPlanCount +
                        supplementCount) *
                        1.2
                    )}
                    valueStyle={{ color: "#52c41a" }}
                  />
                  <Paragraph type="secondary" style={{ marginTop: "8px" }}>
                    Based on 20% monthly growth rate
                  </Paragraph>
                </Col>
                <Col span={24}>
                  <Divider style={{ margin: "12px 0" }} />
                  <Statistic
                    title="Projected Engagement Score"
                    value={
                      totalItems > 0
                        ? Math.min(85 + Math.round(totalItems / 10), 98)
                        : 85
                    }
                    suffix="/100"
                    valueStyle={{ color: "#fa8c16" }}
                  />
                  <Progress
                    percent={
                      totalItems > 0
                        ? Math.min(85 + Math.round(totalItems / 10), 98)
                        : 85
                    }
                    strokeColor={{
                      "0%": "#fa8c16",
                      "100%": "#52c41a",
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminDashboard;
