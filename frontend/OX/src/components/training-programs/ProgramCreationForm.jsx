import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  Table,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import ImageUploader from "../common/ImageUploader";
import {
  createNewExercise,
  formatExercisesForBackend,
  formatExercisesForFrontend,
} from "../../utils/trainingProgramsService";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProgramCreationForm = ({ initialValues = null, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [exercises, setExercises] = useState([]);

  // Initialize form with initial values if provided
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        description: initialValues.description,
        goal_type: initialValues.goal_type,
        difficulty: initialValues.difficulty,
        duration: initialValues.duration,
        frequency: initialValues.frequency || null,
        highlights: initialValues.highlights || null,
        image: initialValues.image_url,
      });

      // Format and set exercises if available
      if (initialValues.exercises) {
        setExercises(formatExercisesForFrontend(initialValues.exercises));
      }
    } else {
      // Start with one empty exercise for new programs
      setExercises([createNewExercise()]);
    }
  }, [initialValues, form]);

  const handleSubmit = (values) => {
    // Validate that we have at least one exercise with required fields
    if (exercises.length === 0 || !validateExercises()) {
      return;
    }

    const formattedExercises = formatExercisesForBackend(exercises);

    const { image, ...restValues } = values;
    // Destructure to remove image from values
    const formData = {
      ...restValues,
      frequency: values.frequency || "3-4 times per week",
      exercises: formattedExercises,
    };

    console.log("Submitting form data:", formData);

    onSubmit(formData);
  };

  const addExercise = () => {
    setExercises([...exercises, createNewExercise()]);
  };

  const removeExercise = (id) => {
    if (exercises.length === 1) {
      // Don't remove the last exercise, just clear it
      setExercises([createNewExercise()]);
      return;
    }
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const updateExercise = (id, field, value) => {
    setExercises(
      exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const validateExercises = () => {
    let valid = true;
    exercises.forEach((ex) => {
      if (!ex.movement || !ex.sets || !ex.reps) {
        valid = false;
      }
    });
    return valid;
  };

  const exerciseColumns = [
    {
      title: "Movement",
      dataIndex: "movement",
      key: "movement",
      render: (_, record) => (
        <Input
          value={record.movement}
          onChange={(e) =>
            updateExercise(record.id, "movement", e.target.value)
          }
          placeholder="e.g. Back Squat"
          required
        />
      ),
    },
    {
      title: "Intensity (kg/%)",
      dataIndex: "intensity",
      key: "intensity",
      render: (_, record) => (
        <Input
          value={record.intensity}
          onChange={(e) =>
            updateExercise(record.id, "intensity", e.target.value)
          }
          placeholder="e.g. 60%"
        />
      ),
    },
    {
      title: "Weight Used",
      dataIndex: "weight_used",
      key: "weight_used",
      render: (_, record) => (
        <Input
          value={record.weight_used}
          onChange={(e) =>
            updateExercise(record.id, "weight_used", e.target.value)
          }
          placeholder="e.g. 80kg"
        />
      ),
    },
    {
      title: "RPE",
      dataIndex: "actual_rpe",
      key: "actual_rpe",
      render: (_, record) => (
        <Input
          value={record.actual_rpe}
          onChange={(e) =>
            updateExercise(record.id, "actual_rpe", e.target.value)
          }
          placeholder="e.g. 7"
        />
      ),
    },
    {
      title: "Sets",
      dataIndex: "sets",
      key: "sets",
      render: (_, record) => (
        <InputNumber
          value={record.sets}
          onChange={(value) => updateExercise(record.id, "sets", value)}
          min={1}
          placeholder="3"
          required
        />
      ),
    },
    {
      title: "Reps",
      dataIndex: "reps",
      key: "reps",
      render: (_, record) => (
        <InputNumber
          value={record.reps}
          onChange={(value) => updateExercise(record.id, "reps", value)}
          min={1}
          placeholder="10"
          required
        />
      ),
    },
    {
      title: "Tempo",
      dataIndex: "tempo",
      key: "tempo",
      render: (_, record) => (
        <Input
          value={record.tempo}
          onChange={(e) => updateExercise(record.id, "tempo", e.target.value)}
          placeholder="e.g. 3-1-3"
        />
      ),
    },
    {
      title: "Rest",
      dataIndex: "rest",
      key: "rest",
      render: (_, record) => (
        <Input
          value={record.rest}
          onChange={(e) => updateExercise(record.id, "rest", e.target.value)}
          placeholder="e.g. 60s"
        />
      ),
    },
    {
      title: "Coach's Notes",
      dataIndex: "notes",
      key: "notes",
      render: (_, record) => (
        <Input
          value={record.notes}
          onChange={(e) => updateExercise(record.id, "notes", e.target.value)}
          placeholder="e.g. Focus on depth"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeExercise(record.id)}
        />
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        title: "",
        description: "",
        goal_type: "strength",
        difficulty: "intermediate",
        duration: 4,
        frequency: "3-4 times per week",
      }}
    >
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card title="Program Details" className="mb-4">
            <Form.Item
              name="title"
              label="Program Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input placeholder="e.g. 12-Week Strength Builder" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Program Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Describe the program, goals, and who it's designed for..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="goal_type"
                  label="Goal Type"
                  rules={[{ required: true, message: "Please select a goal" }]}
                >
                  <Select placeholder="Select goal">
                    <Option value="strength">Strength</Option>
                    <Option value="hypertrophy">Hypertrophy</Option>
                    <Option value="endurance">Endurance</Option>
                    <Option value="weight loss">Weight Loss</Option>
                    <Option value="general fitness">General Fitness</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="difficulty"
                  label="Difficulty Level"
                  rules={[
                    { required: true, message: "Please select difficulty" },
                  ]}
                >
                  <Select placeholder="Select difficulty">
                    <Option value="beginner">Beginner</Option>
                    <Option value="intermediate">Intermediate</Option>
                    <Option value="advanced">Advanced</Option>
                    <Option value="expert">Expert</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="duration"
                  label="Duration (weeks)"
                  rules={[{ required: true, message: "Enter duration" }]}
                >
                  <InputNumber min={1} max={52} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="frequency"
                  label="Workout Frequency"
                  rules={[
                    {
                      required: true,
                      message: "Please enter workout frequency",
                    },
                  ]}
                >
                  <Input placeholder="e.g. 3-4 times per week" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="highlights" label="Program Highlights">
                  <Input placeholder="e.g. Focuses on compound movements" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Program Image" className="mb-4">
            <Form.Item name="image" label="Upload Cover Image">
              <ImageUploader />
            </Form.Item>
            <Text type="secondary">
              Upload an image that represents this program. For best results,
              use a 16:9 aspect ratio.
            </Text>
          </Card>
        </Col>
      </Row>

      <Card title="Program Exercises" className="mb-4">
        <div className="mb-4">
          <Text>
            Define the exercises included in this program. Include details like
            movement, intensity, sets, reps, and coaching notes.
          </Text>
        </div>

        <Table
          columns={exerciseColumns}
          dataSource={exercises}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
          bordered
        />

        <div className="mt-4">
          <Button
            type="dashed"
            onClick={addExercise}
            icon={<PlusOutlined />}
            block
          >
            Add Exercise
          </Button>
        </div>
      </Card>

      <div className="flex justify-end mt-4">
        <Button type="primary" htmlType="submit" loading={loading} size="large">
          {initialValues ? "Update Program" : "Create Program"}
        </Button>
      </div>
    </Form>
  );
};

export default ProgramCreationForm;
