import React, { useState, useEffect } from "react";
import { Card, Button, Radio, Table, Empty, Form, notification } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { Line } from "react-chartjs-2";
import axios from "axios";
import dayjs from "dayjs";
import WeightModal from "./WeightModal";

const API_URL = "http://localhost:8000/api/v1/auth";

const WeightHistory = ({ userId, selectedDate, token }) => {
  const [weightForm] = Form.useForm();
  const [weightHistory, setWeightHistory] = useState([]);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [weightChartPeriod, setWeightChartPeriod] = useState("all");

  // Fetch weight history on component mount and when props change
  useEffect(() => {
    if (userId) {
      fetchWeightHistory();
    }
  }, [userId]);

  // Fetch weight history
  const fetchWeightHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/progress/weight/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setWeightHistory(
          response.data.data.map((entry) => ({
            ...entry,
            date: dayjs(entry.date),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching weight history:", error);
      setWeightHistory([]);
    }
  };

  // Add weight entry
  const addWeightEntry = async (values) => {
    try {
      const payload = {
        weight: values.weight,
        date: values.date.format("YYYY-MM-DD"),
        notes: values.notes || "",
      };

      const response = await axios.post(
        `${API_URL}/progress/weight/${userId}/add`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        notification.success({
          message: "Weight Recorded",
          description: "Your weight has been recorded successfully.",
        });

        // Refresh weight history
        fetchWeightHistory();

        // Close modal and reset form
        setWeightModalVisible(false);
        weightForm.resetFields();
      }
    } catch (error) {
      console.error("Error adding weight entry:", error);
      notification.error({
        message: "Failed to Add Weight",
        description: "There was a problem recording your weight.",
      });
    }
  };

  // Handle modal cancel event
  const handleModalCancel = () => {
    setWeightModalVisible(false);
    weightForm.resetFields();
  };

  // Delete weight entry
  const deleteWeightEntry = async (weightId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/progress/weight/${userId}/${weightId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        notification.success({
          message: "Weight Entry Deleted",
          description: "Weight entry has been removed successfully.",
        });

        // Refresh weight history
        fetchWeightHistory();
      }
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      notification.error({
        message: "Failed to Delete Entry",
        description: "There was a problem deleting the weight entry.",
      });
    }
  };

  // Format weight history for chart based on selected period
  const formatWeightDataForChart = () => {
    let filteredData = [...weightHistory];

    // Filter data based on selected period
    if (weightChartPeriod !== "all") {
      const cutoffDate = dayjs().subtract(
        weightChartPeriod === "1m" ? 1 : weightChartPeriod === "3m" ? 3 : 6,
        "months"
      );
      filteredData = filteredData.filter((entry) =>
        entry.date.isAfter(cutoffDate)
      );
    }

    // Sort chronologically
    const sortedData = filteredData.sort((a, b) => a.date - b.date);

    return {
      labels: sortedData.map((entry) => entry.date.format("MMM DD")),
      datasets: [
        {
          label: "Weight (kg)",
          data: sortedData.map((entry) => entry.weight),
          fill: {
            target: "origin",
            above: "rgba(75, 192, 192, 0.1)",
          },
          backgroundColor: "rgb(75, 192, 192)",
          borderColor: "rgba(75, 192, 192, 0.8)",
          tension: 0.2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Weight (kg)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return dayjs(tooltipItems[0].label, "MMM DD").format(
              "MMMM D, YYYY"
            );
          },
        },
      },
    },
  };

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Weight History</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setWeightModalVisible(true);
                weightForm.setFieldsValue({
                  date: selectedDate,
                });
              }}
            >
              Add Entry
            </Button>
          </div>
        }
        className="mb-6"
      >
        {weightHistory.length === 0 ? (
          <Empty description="No weight entries yet. Start tracking your progress!" />
        ) : (
          <>
            <div className="mb-4">
              <Radio.Group
                value={weightChartPeriod}
                onChange={(e) => setWeightChartPeriod(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="1m">1 Month</Radio.Button>
                <Radio.Button value="3m">3 Months</Radio.Button>
                <Radio.Button value="6m">6 Months</Radio.Button>
                <Radio.Button value="all">All Time</Radio.Button>
              </Radio.Group>
            </div>

            <div className="h-80">
              <Line data={formatWeightDataForChart()} options={chartOptions} />
            </div>
          </>
        )}
      </Card>

      <Card title="Weight Entries" className="mb-6">
        {weightHistory.length === 0 ? (
          <Empty description="No weight entries" />
        ) : (
          <Table
            dataSource={[...weightHistory].sort((a, b) => b.date - a.date)}
            rowKey="weight_id"
            pagination={{ pageSize: 10 }}
          >
            <Table.Column
              title="Date"
              dataIndex="date"
              key="date"
              render={(date) => date.format("MMMM D, YYYY")}
              sorter={(a, b) => a.date - b.date}
              defaultSortOrder="descend"
            />
            <Table.Column
              title="Weight (kg)"
              dataIndex="weight"
              key="weight"
              render={(text) => text}
              sorter={(a, b) => a.weight - b.weight}
            />
            <Table.Column
              title="Notes"
              dataIndex="notes"
              key="notes"
              render={(text) => text || "-"}
            />
            <Table.Column
              title="Action"
              key="action"
              width={100}
              render={(_, record) => (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteWeightEntry(record.weight_id)}
                />
              )}
            />
          </Table>
        )}
      </Card>

      {/* Use the WeightModal component */}
      <WeightModal
        visible={weightModalVisible}
        onCancel={handleModalCancel}
        onSubmit={addWeightEntry}
        form={weightForm}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default WeightHistory;
