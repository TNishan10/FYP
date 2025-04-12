import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Card } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminStats = () => {
  const [userData, setUserData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = sessionStorage.getItem("token");

        // This endpoint should return user registration data by date
        const response = await axios.get(
          "http://localhost:8000/api/v1/auth/admin/user-stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          const { dates, counts } = response.data.data;

          setUserData({
            labels: dates,
            datasets: [
              {
                label: "New Users",
                data: counts,
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "User Growth",
      },
    },
  };

  return (
    <Card title="User Registration Trend">
      <Line options={options} data={userData} />
    </Card>
  );
};

export default AdminStats;
