import React from "react";
import { Modal, Form, InputNumber, Button, Input, Tag } from "antd";

const ExerciseModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  selectedExercise,
}) => {
  return (
    <Modal
      title={`Log ${selectedExercise?.name || "Exercise"}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {selectedExercise && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Tag color="blue">{selectedExercise.muscle_group || "General"}</Tag>
            <Tag color="cyan">{selectedExercise.equipment || "Bodyweight"}</Tag>
            {selectedExercise.difficulty && (
              <Tag color="orange">{selectedExercise.difficulty}</Tag>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="sets"
            label="Sets"
            rules={[{ required: true, message: "Required" }]}
            initialValue={3}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="reps"
            label="Reps"
            rules={[{ required: true, message: "Required" }]}
            initialValue={10}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </div>

        <Form.Item name="weight" label="Weight (kg - optional)">
          <InputNumber min={0} step={0.5} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="notes" label="Notes (optional)">
          <Input.TextArea />
        </Form.Item>

        <div className="flex justify-end">
          <Button onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Log Exercise
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ExerciseModal;
