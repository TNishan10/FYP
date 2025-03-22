import React, { useState, useEffect } from "react";
import { Table, Card, Progress, Spin } from "antd";
import axios from "axios";

const Chart = () => {
  const [userMetrics, setUserMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = localStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        if (!userId || !token) {
          setError("Authentication required");
          return;
        }

        const response = await axios.get(
          `http://localhost:8000/api/v1/auth/users/${userId}/info`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success && response.data.data) {
          const data = response.data.data;

          // Define average measurements for comparison
          const averages = {
            neck: 39,
            shoulder: 112,
            forearm: 27,
            biceps: 35,
            hip: 97,
            thigh: 59,
            calves: 38,
          };

          // Format data for table
          const metrics = [
            {
              key: "neck",
              name: "Neck Size",
              average: averages.neck,
              yours: data.neck_size || 0,
              progress: data.neck_size
                ? Math.min(
                    Math.round((data.neck_size / averages.neck) * 100),
                    150
                  )
                : 0,
            },
            {
              key: "shoulder",
              name: "Shoulder Size",
              average: averages.shoulder,
              yours: data.shoulder_size || 0,
              progress: data.shoulder_size
                ? Math.min(
                    Math.round((data.shoulder_size / averages.shoulder) * 100),
                    150
                  )
                : 0,
            },
            {
              key: "forearm",
              name: "Forearm Size",
              average: averages.forearm,
              yours: data.forearm_size || 0,
              progress: data.forearm_size
                ? Math.min(
                    Math.round((data.forearm_size / averages.forearm) * 100),
                    150
                  )
                : 0,
            },
            {
              key: "biceps",
              name: "Biceps Size",
              average: averages.biceps,
              yours: data.biceps_size || 0,
              progress: data.biceps_size
                ? Math.min(
                    Math.round((data.biceps_size / averages.biceps) * 100),
                    150
                  )
                : 0,
            },
            {
              key: "hip",
              name: "Hip Size",
              average: averages.hip,
              yours: data.hip_size || 0,
              progress: data.hip_size
                ? Math.min(
                    Math.round((data.hip_size / averages.hip) * 100),
                    150
                  )
                : 0,
            },
            {
              key: "thigh",
              name: "Thigh Size",
              average: averages.thigh,
              yours: data.thigh_size || 0,
              progress: data.thigh_size
                ? Math.min(
                    Math.round((data.thigh_size / averages.thigh) * 100),
                    150
                  )
                : 0,
            },
            {
              key: "calves",
              name: "Calves Size",
              average: averages.calves,
              yours: data.claves_size || 0, // API uses "claves"
              progress: data.claves_size
                ? Math.min(
                    Math.round((data.claves_size / averages.calves) * 100),
                    150
                  )
                : 0,
            },
          ];

          setUserMetrics(metrics);
        }
      } catch (error) {
        console.error("Error fetching user metrics:", error);
        setError("Failed to load user metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchUserMetrics();
  }, []);

  const columns = [
    {
      title: "Measurement",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Average (cm)",
      dataIndex: "average",
      key: "average",
    },
    {
      title: "Your Size (cm)",
      dataIndex: "yours",
      key: "yours",
      render: (value) => (
        <span style={{ color: value > 0 ? "#1890ff" : "#bfbfbf" }}>
          {value > 0 ? value : "Not set"}
        </span>
      ),
    },
    {
      title: "Comparison",
      dataIndex: "progress",
      key: "progress",
      render: (percent, record) =>
        record.yours > 0 ? (
          <Progress
            percent={percent}
            size="small"
            status={percent > 110 ? "exception" : "active"}
            strokeColor={{
              from: "#108ee9",
              to: percent > 100 ? "#ff4d4f" : "#52c41a",
            }}
          />
        ) : (
          <span className="text-gray-400">No data</span>
        ),
    },
  ];

  return (
    <Card className="p-4 bg-white rounded-3xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        Body Measurements Comparison
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : (
        <Table
          dataSource={userMetrics}
          columns={columns}
          pagination={false}
          className="border rounded-lg"
        />
      )}
    </Card>
  );
};

export default Chart;
