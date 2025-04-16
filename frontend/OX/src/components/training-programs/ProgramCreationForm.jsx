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
  Steps,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  FileImageOutlined,
  TableOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import ImageUploader from "./ImageUploader.jsx";
import {
  createNewExercise,
  formatExercisesForBackend,
  formatExercisesForFrontend,
} from "../../utils/trainingProgramsService";
import axios from "axios";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const ProgramCreationForm = ({ initialValues = null, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [exercises, setExercises] = useState([]);
  const [imageUrl, setImageUrl] = useState(initialValues?.image_url || "");
  const [fileList, setFileList] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  // Add state to preserve form data between steps
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal_type: "strength",
    difficulty: "intermediate",
    duration: 4,
    frequency: "3-4 times per week",
    highlights: "",
    image: "",
  });

  // Initialize form with initial values if provided
  useEffect(() => {
    if (initialValues) {
      const initialFormData = {
        title: initialValues.title,
        description: initialValues.description,
        goal_type: initialValues.goal_type,
        difficulty: initialValues.difficulty,
        duration: initialValues.duration,
        frequency: initialValues.frequency || "",
        highlights: initialValues.highlights || "",
        image: initialValues.image_url || "",
      };

      setFormData(initialFormData);
      form.setFieldsValue(initialFormData);

      // Format and set exercises if available
      if (initialValues.exercises) {
        setExercises(formatExercisesForFrontend(initialValues.exercises));
      }

      // If editing, set image if available
      if (initialValues.image_url) {
        setImageUrl(initialValues.image_url);
        setFileList([
          {
            uid: "-1",
            name: "program-image.jpg",
            status: "done",
            url: initialValues.image_url,
          },
        ]);
      }
    } else {
      // Start with one empty exercise for new programs
      setExercises([createNewExercise()]);

      // Set default values
      form.setFieldsValue({
        title: "",
        description: "",
        goal_type: "strength",
        difficulty: "intermediate",
        duration: 4,
        frequency: "3-4 times per week",
      });
    }
  }, [initialValues, form]);

  // Save form data when moving between steps
  const saveFormData = async () => {
    try {
      const values = await form.validateFields();
      setFormData((prev) => ({ ...prev, ...values }));
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    console.log("Handle submit called");

    try {
      // Get values from all steps
      const allFormData = { ...formData };
      console.log("All form data:", allFormData);
      console.log("Image URL:", imageUrl);

      // Validate that we have at least one exercise with required fields
      if (exercises.length === 0 || !validateExercises()) {
        message.error("Please complete all required exercise fields");
        return;
      }

      // Validate image is uploaded
      if (!imageUrl) {
        message.error("Please upload a program image");
        setCurrentStep(1); // Go back to image step
        return;
      }

      const formattedExercises = formatExercisesForBackend(exercises);

      // Create the form data structure exactly as expected by the backend
      const programData = {
        title: allFormData.title,
        description: allFormData.description,
        goal_type: allFormData.goal_type,
        difficulty: allFormData.difficulty,
        duration: parseInt(allFormData.duration, 10),
        frequency: allFormData.frequency || "3-4 times per week",
        highlights: allFormData.highlights || "",
        exercises: formattedExercises,
        image: imageUrl,
      };

      // Validate required fields
      if (
        !programData.title ||
        !programData.description ||
        !programData.goal_type ||
        !programData.difficulty ||
        !programData.duration
      ) {
        console.error("Missing required fields:", {
          title: !!programData.title,
          description: !!programData.description,
          goal_type: !!programData.goal_type,
          difficulty: !!programData.difficulty,
          duration: !!programData.duration,
        });
        message.error("Please complete all required fields");
        setCurrentStep(0); // Go back to first step
        return;
      }

      // Get authentication token from session storage
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to create a program");
        return;
      }

      console.log("Submitting form data:", programData);

      // Use direct axios call with the CORRECT ENDPOINT
      let response;

      if (initialValues) {
        // Update existing program - use the correct endpoint from authRoute.js
        response = await axios.put(
          `http://localhost:8000/api/v1/auth/training-programs/${initialValues.program_id}`,
          programData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success("Program updated successfully");
      } else {
        // Create new program - use the correct endpoint from authRoute.js
        response = await axios.post(
          "http://localhost:8000/api/v1/auth/training-programs",
          programData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success("Program created successfully");
      }

      console.log("API response:", response.data);

      // Call the onSubmit prop to handle any parent component actions
      if (onSubmit) {
        onSubmit(programData);
      }
    } catch (error) {
      console.error("Error submitting program:", error);

      // Detailed error logging
      if (error.response) {
        console.error("Response error details:", {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        });

        // Check for specific error types
        if (error.response.status === 401) {
          message.error("Unauthorized. Please login with admin privileges.");
        } else if (error.response.status === 400) {
          message.error(
            error.response.data.message ||
              "Invalid form data. Please check all fields."
          );
        } else {
          message.error(
            error.response.data.message || "Failed to save program"
          );
        }
      } else {
        message.error(
          "Network error. Please check your connection and try again."
        );
      }
    }
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

  const nextStep = async () => {
    // Save current step data before moving forward
    const isValid = await saveFormData();

    if (!isValid) {
      message.error("Please complete all required fields in this step");
      return;
    }

    // Add validation check for image before proceeding from image step
    if (currentStep === 1 && !imageUrl) {
      message.warning("Please upload a program image before proceeding");
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
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
      initialValues={formData}
      // Remove this line to prevent double submission
      // onFinish={handleSubmit}
      onValuesChange={(changedValues, allValues) => {
        // Update form data state when values change
        console.log("Form values changed:", changedValues);
        setFormData((prev) => ({ ...prev, ...changedValues }));
      }}
    >
      <div className="mb-8">
        <Steps current={currentStep}>
          <Step title="Program Details" icon={<InfoCircleOutlined />} />
          <Step title="Program Image" icon={<FileImageOutlined />} />
          <Step title="Exercises" icon={<TableOutlined />} />
        </Steps>
      </div>

      {currentStep === 0 && (
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
            rules={[{ required: true, message: "Please enter a description" }]}
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
      )}

      {currentStep === 1 && (
        <Card title="Program Image" className="mb-4">
          <div className="max-w-md mx-auto">
            <Form.Item
              name="image"
              label="Upload Cover Image"
              rules={[
                { required: true, message: "Please upload a program image" },
              ]}
            >
              <ImageUploader
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                fileList={fileList}
                setFileList={setFileList}
                form={form}
              />
            </Form.Item>
            <Text type="secondary">
              Upload an image that represents this program. For best results,
              use a 16:9 aspect ratio.
            </Text>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card title="Program Exercises" className="mb-4">
          <div className="mb-4">
            <Text>
              Define the exercises included in this program. Include details
              like movement, intensity, sets, reps, and coaching notes.
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
      )}

      <div className="flex justify-between mt-4">
        {currentStep > 0 && (
          <Button onClick={prevStep} size="large">
            Previous
          </Button>
        )}

        {currentStep < 2 && (
          <Button
            type="primary"
            onClick={nextStep}
            size="large"
            style={{ marginLeft: "auto" }}
          >
            Next
          </Button>
        )}

        {currentStep === 2 && (
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            size="large"
            style={{ marginLeft: "auto" }}
          >
            {initialValues ? "Update Program" : "Create Program"}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default ProgramCreationForm;
