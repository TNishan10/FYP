import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Table,
  Empty,
  Form,
  notification,
  Select,
  InputNumber,
  Space,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const API_URL = "http://localhost:8000/api/v1/auth";

// Static muscle groups list
const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Arms",
  "Shoulder",
  "Forearms",
  "Neck",
  "Abs",
  "Legs",
];

const ExerciseLog = ({ userId, selectedDate, token }) => {
  const [exerciseForm] = Form.useForm();

  // States for exercise tracking
  const [userExercises, setUserExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  // Effect to fetch data on mount
  useEffect(() => {
    if (userId) {
      fetchUserExercises();
    }
  }, [userId, selectedDate]);

  // Fetch user exercises for a date
  const fetchUserExercises = async () => {
    try {
      setLoading(true);
      const formattedDate = selectedDate.format("YYYY-MM-DD");

      const response = await axios.get(`${API_URL}/exercises/user/${userId}`, {
        params: { date: formattedDate },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUserExercises(
          Array.isArray(response.data.data.exercises)
            ? response.data.data.exercises
            : []
        );
      } else {
        setUserExercises([]);
      }
    } catch (error) {
      console.error("Error fetching user exercises:", error);
      setUserExercises([]);
    } finally {
      setLoading(false);
    }
  };

  // Log exercise function
  const handleLogExercise = async (values) => {
    try {
      setLoading(true);

      const payload = {
        exercise_name: values.exercise_name, // Changed from exercise_id to exercise_name
        muscle_group: values.muscle_group,
        date: selectedDate.format("YYYY-MM-DD"),
        sets: values.sets,
        reps: values.reps,
        weight: values.weight,
        rest: values.rest,
        notes: values.notes || "",
      };

      const response = await axios.post(
        `${API_URL}/exercises/log/${userId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        notification.success({
          message: "Exercise Logged",
          description: "Your exercise has been added to your log.",
        });

        // Refresh user exercises and reset form
        fetchUserExercises();
        exerciseForm.resetFields();
      }
    } catch (error) {
      console.error("Error logging exercise:", error);
      notification.error({
        message: "Failed to Log Exercise",
        description: "There was a problem logging your exercise.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove user exercise
  const removeUserExercise = async (logId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/exercises/log/${userId}/remove/${logId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        notification.success({
          message: "Exercise Removed",
          description: "Exercise removed from your log.",
        });

        // Refresh user exercises
        fetchUserExercises();
      }
    } catch (error) {
      console.error("Error removing exercise:", error);
      notification.error({
        message: "Failed to Remove Exercise",
        description: "There was a problem removing the exercise from your log.",
      });
    }
  };

  // Exercise log columns for table
  const exerciseColumns = [
    {
      title: "Exercise",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {record.muscle_group || "Unknown"}
          </div>
        </div>
      ),
    },
    {
      title: "Sets",
      dataIndex: "sets",
      key: "sets",
      width: 80,
    },
    {
      title: "Reps",
      dataIndex: "reps",
      key: "reps",
      width: 80,
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      width: 100,
      render: (text) => (text ? `${text} kg` : "Bodyweight"),
    },
    {
      title: "Rest",
      dataIndex: "rest",
      key: "rest",
      width: 100,
      render: (text) => (text ? `${text} sec` : "-"),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeUserExercise(record.log_id)}
        />
      ),
    },
  ];

  const safeUserExercises = Array.isArray(userExercises) ? userExercises : [];

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Exercise Log</span>
            <span className="ml-auto text-sm text-gray-500">
              {selectedDate.format("MMMM D, YYYY")}
            </span>
          </div>
        }
        className="mb-6"
      >
        {loading && userExercises.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div>Loading exercises...</div>
          </div>
        ) : safeUserExercises.length === 0 ? (
          <Empty description="No exercises logged for this day" />
        ) : (
          <Table
            dataSource={safeUserExercises}
            columns={exerciseColumns}
            rowKey={(record) =>
              record.log_id || record.id || Math.random().toString()
            }
            pagination={false}
          />
        )}
      </Card>

      <Card title="Log a New Exercise" className="mb-6">
        <Form
          form={exerciseForm}
          layout="vertical"
          onFinish={handleLogExercise}
          initialValues={{
            sets: 3,
            reps: 10,
            rest: 60,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="muscle_group"
              label="Muscle Group"
              rules={[
                { required: true, message: "Please select a muscle group" },
              ]}
            >
              <Select
                placeholder="Select muscle group"
                onChange={(value) => setSelectedMuscleGroup(value)}
                options={MUSCLE_GROUPS.map((group) => ({
                  label: group,
                  value: group,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="exercise_name"
              label="Exercise Name"
              rules={[
                { required: true, message: "Please enter the exercise name" },
              ]}
            >
              <Input placeholder="Enter exercise name" maxLength={100} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Sets"
              name="sets"
              rules={[
                { required: true, message: "Please enter number of sets" },
              ]}
            >
              <InputNumber min={1} max={100} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Reps"
              name="reps"
              rules={[
                { required: true, message: "Please enter number of reps" },
              ]}
            >
              <InputNumber min={1} max={1000} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Weight (kg)"
              name="weight"
              tooltip="Leave empty for bodyweight exercise"
            >
              <InputNumber
                min={0}
                max={1000}
                step={2.5}
                style={{ width: "100%" }}
                placeholder="Weight in kg"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Rest Time (seconds)"
              name="rest"
              tooltip="Rest time between sets"
            >
              <InputNumber
                min={0}
                max={600}
                step={5}
                style={{ width: "100%" }}
                placeholder="Rest time in seconds"
              />
            </Form.Item>

            <Form.Item label="Notes" name="notes">
              <Input.TextArea
                rows={1}
                placeholder="Any notes about this exercise..."
              />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Log Exercise
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ExerciseLog;
