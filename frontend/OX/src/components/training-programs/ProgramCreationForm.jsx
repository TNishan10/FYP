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
  DatePicker,
  Tabs,
  Collapse,
  Empty,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  FileImageOutlined,
  CalendarOutlined,
  TableOutlined,
} from "@ant-design/icons";
import ImageUploader from "./ImageUploader.jsx";
import {
  createNewExercise,
  formatExercisesForBackend,
  formatExercisesForFrontend,
} from "../../utils/trainingProgramsService";
import axios from "axios";
import moment from "moment";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const ProgramCreationForm = ({ initialValues = null, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [workoutDays, setWorkoutDays] = useState([]);
  const [currentWorkoutDay, setCurrentWorkoutDay] = useState(null);
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

      // Format and set workout days if available
      if (initialValues.workout_days && initialValues.workout_days.length > 0) {
        const formattedWorkoutDays = initialValues.workout_days.map((day) => ({
          id: day.workout_day_id.toString(),
          workout_date: moment(day.workout_date),
          day_name: day.day_name || "",
          notes: day.notes || "",
          exercises: day.exercises
            ? day.exercises.map((exercise, index) => ({
                id: `${day.workout_day_id}-${index}`,
                movement: exercise.movement,
                intensity: exercise.intensity_kg || "",
                weight_used: exercise.weight_used || "",
                actual_rpe: exercise.actual_rpe || "",
                sets: exercise.sets,
                reps: exercise.reps,
                tempo: exercise.tempo || "",
                rest: exercise.rest || "",
                notes: exercise.coaches_notes || "",
              }))
            : [],
        }));

        setWorkoutDays(formattedWorkoutDays);
        if (formattedWorkoutDays.length > 0) {
          setCurrentWorkoutDay(formattedWorkoutDays[0].id);
        }
      } else if (initialValues.exercises) {
        // Handle old format - create a default workout day with all exercises
        const defaultWorkoutDay = {
          id: "default",
          workout_date: moment(),
          day_name: "Default Workout",
          notes: "",
          exercises: formatExercisesForFrontend(initialValues.exercises),
        };
        setWorkoutDays([defaultWorkoutDay]);
        setCurrentWorkoutDay("default");
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
      // Initialize with empty state for new programs
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

      // For testing/direct API submission, bypass the workout day validation
      // Add a default workout day with exercises if none exists
      let formattedWorkoutDays = [];

      if (workoutDays.length === 0) {
        console.log(
          "No workout days found, creating a default one for testing"
        );

        // Create a default workout day with a test exercise
        const defaultDay = {
          workout_date: moment().format("YYYY-MM-DD"),
          day_name: "Default Workout Day",
          notes: "Auto-generated for API testing",
          exercises: [
            {
              movement: "Back Squat",
              intensity_kg: "60%",
              weight_used: "80",
              actual_rpe: "7",
              sets: 3,
              reps: 10,
              tempo: "",
              rest: "",
              coaches_notes: "Competition Depth",
            },
          ],
        };

        formattedWorkoutDays = [defaultDay];
        console.log("Created default workout day:", defaultDay);
      } else {
        // Format existing workout days
        // Format existing workout days
        formattedWorkoutDays = workoutDays.map((day) => ({
          workout_date: day.workout_date.format("YYYY-MM-DD"),
          day_name: day.day_name || "Workout Day", // Ensure day_name is never empty
          notes: day.notes || null, // Use null instead of empty string
          exercises: (day.exercises || []).map((ex) => ({
            movement: ex.movement || "Default Exercise",
            intensity_kg: ex.intensity || null, // Use null instead of empty string
            weight_used: ex.weight_used || null, // Use null instead of empty string
            actual_rpe: ex.actual_rpe || null, // Use null instead of empty string
            sets: ex.sets || 3,
            reps: ex.reps || "8-10", // Ensure reps is a string
            tempo: ex.tempo || null, // Use null instead of empty string
            rest: ex.rest || null, // Use null instead of empty string
            coaches_notes: ex.notes || null, // Use null instead of empty string
          })),
        }));
      }

      // Validate image is uploaded
      if (!imageUrl) {
        message.error("Please upload a program image");
        setCurrentStep(1); // Go back to image step
        return;
      }

      // Create the form data structure
      const programData = {
        title: allFormData.title,
        description: allFormData.description,
        goal_type: allFormData.goal_type,
        difficulty: allFormData.difficulty,
        duration: parseInt(allFormData.duration, 10),
        frequency: allFormData.frequency || "3-4 times per week",
        highlights: allFormData.highlights || "",
        workout_days: formattedWorkoutDays,
        image: imageUrl,
      };

      // Get authentication token from session storage
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to create a program");
        return;
      }

      console.log("About to make API call with data:", programData);

      // Make API call
      let response;
      try {
        if (initialValues) {
          // Update existing program
          console.log("Updating existing program...");
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
        } else {
          // Create new program
          console.log("Creating new program...");
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
        }

        console.log("API response received:", response.data);
        message.success(
          initialValues
            ? "Program updated successfully"
            : "Program created successfully"
        );

        // Call the onSubmit prop to handle any parent component actions
        if (onSubmit) {
          onSubmit(programData);
        }
      } catch (error) {
        console.error("API call failed:", error);
        throw error; // Re-throw to be caught by outer catch
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

  // Create a new workout day
  const addWorkoutDay = () => {
    const newWorkoutDay = {
      id: `day-${Date.now()}`,
      workout_date: moment(),
      day_name: "",
      notes: "",
      exercises: [],
    };

    setWorkoutDays([...workoutDays, newWorkoutDay]);
    setCurrentWorkoutDay(newWorkoutDay.id);
  };

  // Remove a workout day
  const removeWorkoutDay = (dayId) => {
    const updatedDays = workoutDays.filter((day) => day.id !== dayId);
    setWorkoutDays(updatedDays);

    if (updatedDays.length > 0) {
      setCurrentWorkoutDay(updatedDays[0].id);
    } else {
      setCurrentWorkoutDay(null);
    }
  };

  // Update a workout day
  const updateWorkoutDay = (dayId, field, value) => {
    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === dayId ? { ...day, [field]: value } : day
      )
    );
  };

  // Add exercise to the current workout day
  const addExercise = () => {
    if (!currentWorkoutDay) return;

    const newExercise = createNewExercise();

    setWorkoutDays(
      workoutDays.map((day) => {
        if (day.id === currentWorkoutDay) {
          return {
            ...day,
            exercises: [...(day.exercises || []), newExercise],
          };
        }
        return day;
      })
    );
  };

  // Remove exercise from a workout day
  const removeExercise = (dayId, exerciseId) => {
    setWorkoutDays(
      workoutDays.map((day) => {
        if (day.id === dayId) {
          const exercises = day.exercises.filter((ex) => ex.id !== exerciseId);
          return {
            ...day,
            exercises: exercises.length > 0 ? exercises : [createNewExercise()],
          };
        }
        return day;
      })
    );
  };

  // Update an exercise in a workout day
  const updateExercise = (dayId, exerciseId, field, value) => {
    setWorkoutDays(
      workoutDays.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: day.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, [field]: value } : ex
            ),
          };
        }
        return day;
      })
    );
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
            updateExercise(
              currentWorkoutDay,
              record.id,
              "movement",
              e.target.value
            )
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
            updateExercise(
              currentWorkoutDay,
              record.id,
              "intensity",
              e.target.value
            )
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
            updateExercise(
              currentWorkoutDay,
              record.id,
              "weight_used",
              e.target.value
            )
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
            updateExercise(
              currentWorkoutDay,
              record.id,
              "actual_rpe",
              e.target.value
            )
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
          onChange={(value) =>
            updateExercise(currentWorkoutDay, record.id, "sets", value)
          }
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
        <Input
          value={record.reps}
          onChange={(e) =>
            updateExercise(currentWorkoutDay, record.id, "reps", e.target.value)
          }
          placeholder="e.g. 8-10"
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
          onChange={(e) =>
            updateExercise(
              currentWorkoutDay,
              record.id,
              "tempo",
              e.target.value
            )
          }
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
          onChange={(e) =>
            updateExercise(currentWorkoutDay, record.id, "rest", e.target.value)
          }
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
          onChange={(e) =>
            updateExercise(
              currentWorkoutDay,
              record.id,
              "notes",
              e.target.value
            )
          }
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
          onClick={() => removeExercise(currentWorkoutDay, record.id)}
        />
      ),
    },
  ];

  // Find the current workout day object
  const currentWorkoutDayObj = workoutDays.find(
    (day) => day.id === currentWorkoutDay
  );

  // Generate collapse items
  const collapseItems = workoutDays.map((day, index) => ({
    key: day.id,
    label: (
      <div className="flex items-center justify-between w-full">
        <span>
          {day.day_name || `Workout ${index + 1}`} -{" "}
          {day.workout_date?.format("MMM DD, YYYY") || "No date"}
        </span>
      </div>
    ),
    children: (
      <>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Workout Date">
              <DatePicker
                value={day.workout_date}
                onChange={(date) =>
                  updateWorkoutDay(day.id, "workout_date", date)
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Workout Name">
              <Input
                value={day.day_name}
                onChange={(e) =>
                  updateWorkoutDay(day.id, "day_name", e.target.value)
                }
                placeholder="e.g. Leg Day"
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Notes">
          <TextArea
            value={day.notes}
            onChange={(e) => updateWorkoutDay(day.id, "notes", e.target.value)}
            rows={2}
            placeholder="Additional notes for this workout day..."
          />
        </Form.Item>
      </>
    ),
    extra: (
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          removeWorkoutDay(day.id);
        }}
      />
    ),
  }));

  // Generate tabs items
  const tabItems = workoutDays.map((day, index) => ({
    key: day.id,
    label: (
      <>
        {day.day_name || `Workout ${index + 1}`}
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {day.workout_date?.format("MMM DD")}
        </Text>
      </>
    ),
    children: null, // We'll render the content outside the Tabs component
  }));

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={formData}
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
          <Step title="Workout Schedule" icon={<CalendarOutlined />} />
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
                  <Option value="weight_loss">Weight Loss</Option>
                  <Option value="general_fitness">General Fitness</Option>
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
        <Card title="Workout Schedule" className="mb-4">
          <div className="mb-4">
            <Text>
              Create workout days for your program. Each day will have its own
              set of exercises.
            </Text>
          </div>

          <div className="mb-4">
            <Button
              type="primary"
              onClick={addWorkoutDay}
              icon={<PlusOutlined />}
            >
              Add Workout Day
            </Button>
          </div>

          {workoutDays.length > 0 ? (
            <Collapse
              defaultActiveKey={[workoutDays[0]?.id]}
              className="mb-4"
              accordion
              items={collapseItems}
            />
          ) : (
            <Empty description="No workout days added yet" />
          )}
        </Card>
      )}

      {currentStep === 3 && (
        <Card title="Program Exercises" className="mb-4">
          <div className="mb-4">
            <Text>
              Add exercises for each workout day. Select a workout day and add
              exercises to it.
            </Text>
          </div>

          {workoutDays.length > 0 ? (
            <>
              <Tabs
                activeKey={currentWorkoutDay || workoutDays[0]?.id}
                onChange={setCurrentWorkoutDay}
                type="card"
                className="mb-4"
                items={tabItems}
              />

              {currentWorkoutDayObj && (
                <>
                  <div className="mb-4">
                    <Title level={5}>
                      {currentWorkoutDayObj.day_name || "Unnamed Workout"} -{" "}
                      {currentWorkoutDayObj.workout_date?.format(
                        "MMMM DD, YYYY"
                      )}
                    </Title>
                    {currentWorkoutDayObj.notes && (
                      <Text type="secondary">{currentWorkoutDayObj.notes}</Text>
                    )}
                  </div>

                  <Table
                    columns={exerciseColumns}
                    dataSource={currentWorkoutDayObj.exercises || []}
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
                      Add Exercise to This Day
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <Empty description="No workout days added. Please go back and add workout days first." />
          )}
        </Card>
      )}

      <div className="flex justify-between mt-4">
        {currentStep > 0 && (
          <Button onClick={prevStep} size="large">
            Previous
          </Button>
        )}

        {currentStep < 3 && (
          <Button
            type="primary"
            onClick={nextStep}
            size="large"
            style={{ marginLeft: "auto" }}
          >
            Next
          </Button>
        )}

        {currentStep === 3 && (
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
