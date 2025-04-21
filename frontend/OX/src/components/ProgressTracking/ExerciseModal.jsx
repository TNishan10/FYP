import React from "react";
import { Modal, Form, Input, InputNumber, Button } from "antd";

const ExerciseModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  selectedExercise,
}) => {
  return (
    <Modal
      title={`Log Exercise: ${selectedExercise?.name || ""}`}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          sets: 3,
          reps: 10,
          weight: "",
          rest: 60,
          notes: "",
        }}
      >
        <Form.Item
          label="Sets"
          name="sets"
          rules={[{ required: true, message: "Please enter number of sets" }]}
        >
          <InputNumber min={1} max={100} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Reps"
          name="reps"
          rules={[{ required: true, message: "Please enter number of reps" }]}
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
            rows={3}
            placeholder="Any notes about this exercise..."
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Log Exercise
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExerciseModal;
