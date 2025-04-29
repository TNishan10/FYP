import React, { useState } from "react";
import { Form, Input, Select, InputNumber, Button, message } from "antd";

const { Option } = Select;

const ExerciseForm = ({ onSubmit, initialValues = {} }) => {
  const [form] = Form.useForm();
  const [exerciseType, setExerciseType] = useState(
    initialValues.type || "strength"
  );

  // Frontend validation function
  const validateExercise = (values) => {
    const errors = {};

    // Check required fields
    if (!values.name) {
      errors.name = "Exercise name is required";
    }

    if (!values.type) {
      errors.type = "Exercise type is required";
    }

    // Validate sets/reps for strength exercises
    if (values.type === "strength") {
      if (values.sets <= 0 || values.sets > 20) {
        errors.sets = "Sets must be between 1 and 20";
      }

      if (values.reps <= 0 || values.reps > 200) {
        errors.reps = "Reps must be between 1 and 200";
      }
    }

    // Validate duration for cardio exercises
    if (
      values.type === "cardio" &&
      (!values.duration || values.duration <= 0)
    ) {
      errors.duration = "Valid duration is required for cardio exercises";
    }

    return errors;
  };

  const handleSubmit = (values) => {
    // Client-side validation
    const validationErrors = validateExercise(values);

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((error) => {
        message.error(error);
      });
      return;
    }

    // If validation passes, submit the data
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label="Exercise Name"
        rules={[{ required: true, message: "Please enter exercise name" }]}
      >
        <Input placeholder="Exercise name" />
      </Form.Item>

      <Form.Item
        name="type"
        label="Exercise Type"
        rules={[{ required: true, message: "Please select exercise type" }]}
      >
        <Select
          placeholder="Select exercise type"
          onChange={(value) => setExerciseType(value)}
        >
          <Option value="strength">Strength</Option>
          <Option value="cardio">Cardio</Option>
          <Option value="flexibility">Flexibility</Option>
          <Option value="balance">Balance</Option>
        </Select>
      </Form.Item>

      {exerciseType === "strength" && (
        <>
          <Form.Item
            name="sets"
            label="Sets"
            rules={[
              { required: true, message: "Please enter number of sets" },
              {
                type: "number",
                min: 1,
                max: 20,
                message: "Sets must be between 1 and 20",
              },
            ]}
          >
            <InputNumber min={1} max={20} />
          </Form.Item>

          <Form.Item
            name="reps"
            label="Reps"
            rules={[
              { required: true, message: "Please enter number of reps" },
              {
                type: "number",
                min: 1,
                max: 200,
                message: "Reps must be between 1 and 200",
              },
            ]}
          >
            <InputNumber min={1} max={200} />
          </Form.Item>

          <Form.Item
            name="weight"
            label="Weight (kg)"
            rules={[
              { type: "number", min: 0, message: "Weight must be positive" },
            ]}
          >
            <InputNumber min={0} step={0.5} />
          </Form.Item>
        </>
      )}

      {exerciseType === "cardio" && (
        <Form.Item
          name="duration"
          label="Duration (minutes)"
          rules={[
            { required: true, message: "Please enter duration" },
            { type: "number", min: 1, message: "Duration must be positive" },
          ]}
        >
          <InputNumber min={1} />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save Exercise
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ExerciseForm;
