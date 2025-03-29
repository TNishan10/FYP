import React, { useState, useEffect } from "react";
import { Card, Statistic, Row, Col, Typography, Divider, message } from "antd";
import {
  UserOutlined,
  HeartOutlined,
  AppleOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [workoutPlanCount, setWorkoutPlanCount] = useState(0);
  const [nutritionPlanCount, setNutritionPlanCount] = useState(0);
  const [supplementCount, setSupplementCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        // Fetch users
        const usersResponse = await axios.get(
          "http://localhost:8000/api/v1/auth/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserCount(usersResponse.data.data.length);

        // Fetch workout plans
        const workoutPlansResponse = await axios.get(
          "http://localhost:8000/api/v1/auth/workout-plans",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWorkoutPlanCount(workoutPlansResponse.data.data.length);

        // Fetch nutrition plans
        const nutritionPlansResponse = await axios.get(
          "http://localhost:8000/api/v1/auth/nutrition-plans",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNutritionPlanCount(nutritionPlansResponse.data.data.length);

        // Fetch supplements
        const supplementsResponse = await axios.get(
          "http://localhost:8000/api/v1/auth/supplement",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (
          supplementsResponse &&
          supplementsResponse.data &&
          supplementsResponse.data.data
        ) {
          setSupplementCount(supplementsResponse.data.data.length);
        } else {
          console.warn(
            "Supplement data structure is unexpected:",
            supplementsResponse
          );
          message.warn("Could not determine supplement count");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const cardStyles = {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "10px",
    border: "none",
    transition: "all 0.3s ease",
  };

  return (
    <>
      <Title level={4} style={{ marginBottom: "24px", color: "#333" }}>
        System Statistics
      </Title>
      <Divider style={{ margin: "16px 0" }} />
      <Row gutter={[24, 24]}>
        {/* Your existing statistics cards */}
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={cardStyles} bodyStyle={{ padding: "24px" }}>
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
        {/* Include the other 3 statistic cards */}
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={cardStyles} bodyStyle={{ padding: "24px" }}>
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
          <Card hoverable style={cardStyles} bodyStyle={{ padding: "24px" }}>
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
          <Card hoverable style={cardStyles} bodyStyle={{ padding: "24px" }}>
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
