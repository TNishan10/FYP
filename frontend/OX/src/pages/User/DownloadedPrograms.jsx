import React, { useEffect, useState } from "react";
import { Typography, List, Card, Tag, Empty, Spin, Button } from "antd";
import {
  DownloadOutlined,
  FileOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

// Goal type colors for visual differentiation
const goalTypeColors = {
  hypertrophy: "#f50",
  strength: "#722ed1",
  cardio: "#1890ff",
  endurance: "#52c41a",
  crossfit: "#faad14",
  hybrid: "#13c2c2",
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const DownloadedPrograms = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      setLoading(true);
      try {
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated");
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/api/v1/auth/user/downloads",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.success) {
          setDownloads(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching downloads:", error);
        setError("Failed to load your downloaded programs");
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  const handleRedownload = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Spin size="large" />
        <div className="mt-3">Loading your downloaded programs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 text-lg mb-2">Error: {error}</div>
        <Button type="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <Empty
        description="You haven't downloaded any training programs yet"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Title level={4} className="mb-4">
        Your Downloaded Programs
      </Title>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
        dataSource={downloads}
        renderItem={(item) => (
          <List.Item>
            <Card
              className="h-full"
              actions={[
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => handleRedownload(item.file_url)}
                >
                  Re-download
                </Button>,
              ]}
            >
              <div className="mb-3">
                <Tag color={goalTypeColors[item.goal_type] || "#108ee9"}>
                  {item.goal_type}
                </Tag>
                {item.difficulty && <Tag>{item.difficulty}</Tag>}
              </div>

              <Title level={5} className="mb-1">
                {item.title}
              </Title>

              <div className="mb-3 text-gray-500 flex items-center">
                <FileOutlined className="mr-1" />
                <Text type="secondary">{item.duration}</Text>
                <Text type="secondary" className="mx-2">
                  •
                </Text>
                <CalendarOutlined className="mr-1" />
                <Text type="secondary">
                  Downloaded {formatDate(item.downloaded_at)}
                </Text>
              </div>

              <div className="text-gray-600 line-clamp-2">
                {item.description.substring(0, 100)}
                {item.description.length > 100 ? "..." : ""}
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default DownloadedPrograms;
