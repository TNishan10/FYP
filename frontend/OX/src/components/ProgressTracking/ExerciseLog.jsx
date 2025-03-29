import React, { useState, useEffect } from "react";
import { Card, Button, Input, Table, Empty, Form, notification } from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import ExerciseModal from "./ExerciseModal";

const API_URL = "http://localhost:8000/api/v1/auth";

const ExerciseLog = ({ userId, selectedDate, token }) => {
  const [exerciseForm] = Form.useForm();

  // States for exercise tracking with proper initialization
  const [exerciseList, setExerciseList] = useState([]);
  const [userExercises, setUserExercises] = useState([]);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Effect to fetch data on mount
  useEffect(() => {
    if (userId) {
      fetchUserExercises();
      fetchExerciseList();
      fetchMuscleGroups();
    }
  }, [userId, selectedDate]);

  // Effect to refetch exercises when muscle group filter changes
  useEffect(() => {
    if (userId) {
      fetchExerciseList();
    }
  }, [selectedMuscleGroup]);

  // Fetch list of muscle groups
  const fetchMuscleGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/exercises/muscle-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMuscleGroups(response.data.data.muscle_groups || []);
      }
    } catch (error) {
      console.error("Error fetching muscle groups:", error);
      setMuscleGroups([]);
    }
  };

  // Fetch exercise list
  const fetchExerciseList = async () => {
    try {
      setLoading(true);
      const params = {};

      if (selectedMuscleGroup !== "all") {
        params.muscle_group = selectedMuscleGroup;
      }

      const response = await axios.get(`${API_URL}/exercises/list`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setExerciseList(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      } else {
        setExerciseList([]);
      }
    } catch (error) {
      console.error("Error fetching exercise list:", error);
      setExerciseList([]);
    } finally {
      setLoading(false);
    }
  };

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
          Array.isArray(response.data.data) ? response.data.data : []
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

  // Log an exercise
  const logExercise = async (values) => {
    try {
      if (!selectedExercise) {
        notification.error({
          message: "No Exercise Selected",
          description: "Please select an exercise to log",
        });
        return;
      }

      const payload = {
        exercise_id: selectedExercise.exercise_id,
        date: selectedDate.format("YYYY-MM-DD"),
        sets: values.sets,
        reps: values.reps,
        weight: values.weight,
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
          description: `${selectedExercise.name} has been added to your exercise log.`,
        });

        // Refresh user exercises
        fetchUserExercises();

        // Close modal and reset form
        setExerciseModalVisible(false);
        exerciseForm.resetFields();
      }
    } catch (error) {
      console.error("Error logging exercise:", error);
      notification.error({
        message: "Failed to Log Exercise",
        description: "There was a problem logging your exercise.",
      });
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

  // Filter exercises by search query
  const getFilteredExercises = () => {
    if (!Array.isArray(exerciseList)) return [];
    if (!exerciseSearchQuery) return exerciseList;

    return exerciseList.filter((exercise) =>
      exercise.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase())
    );
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

  // Make sure we have valid arrays for Table components
  const filteredExercises = getFilteredExercises();
  const safeUserExercises = Array.isArray(userExercises) ? userExercises : [];

  // Close the exercise modal and reset form
  const handleCloseExerciseModal = () => {
    setExerciseModalVisible(false);
    exerciseForm.resetFields();
  };

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
        {loading ? (
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

      <Card title="Add Exercise" className="mb-6">
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              type={selectedMuscleGroup === "all" ? "primary" : "default"}
              onClick={() => setSelectedMuscleGroup("all")}
            >
              All
            </Button>

            {muscleGroups.map((group) => (
              <Button
                key={group}
                type={selectedMuscleGroup === group ? "primary" : "default"}
                onClick={() => setSelectedMuscleGroup(group)}
              >
                {group}
              </Button>
            ))}
          </div>

          <Input
            placeholder="Search for exercises..."
            value={exerciseSearchQuery}
            onChange={(e) => setExerciseSearchQuery(e.target.value)}
            prefix={<SearchOutlined />}
            className="mb-4"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div>Loading exercises...</div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table
              dataSource={filteredExercises}
              rowKey={(record) =>
                record.exercise_id || record.id || Math.random().toString()
              }
              pagination={{ pageSize: 5 }}
              size="small"
            >
              <Table.Column
                title="Exercise"
                dataIndex="name"
                key="name"
                render={(text, record) => (
                  <div>
                    <div className="font-medium">{text || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                      {record.muscle_group || "Unknown"}
                    </div>
                  </div>
                )}
              />
              <Table.Column
                title="Equipment"
                dataIndex="equipment"
                key="equipment"
                width={150}
                render={(text) => text || "Bodyweight"}
              />
              <Table.Column
                title="Action"
                key="action"
                width={100}
                render={(_, record) => (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      setSelectedExercise(record);
                      setExerciseModalVisible(true);
                    }}
                  >
                    Log
                  </Button>
                )}
              />
            </Table>
          </div>
        )}
      </Card>

      {/* Use the ExerciseModal component instead of inline modal */}
      <ExerciseModal
        visible={exerciseModalVisible}
        onCancel={handleCloseExerciseModal}
        onSubmit={logExercise}
        form={exerciseForm}
        selectedExercise={selectedExercise}
      />
    </div>
  );
};

export default ExerciseLog;
