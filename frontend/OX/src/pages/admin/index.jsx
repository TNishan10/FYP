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
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  AppleOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [workoutPlanCount, setWorkoutPlanCount] = useState(0);
  const [nutritionPlanCount, setNutritionPlanCount] = useState(0);
  const [supplementCount, setSupplementCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={4} style={{ color: "#333", margin: 0 }}>
          System Statistics
        </Title>
        <Button
          icon={<ReloadOutlined />}
          loading={isRefreshing}
          onClick={handleRefresh}
        >
          Refresh Stats
        </Button>
      </div>
      <Divider style={{ margin: "16px 0" }} />
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
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboard;
