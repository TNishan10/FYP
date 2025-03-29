import React from "react";
import { Modal, Form, InputNumber, Select, Button, Tag } from "antd";

const { Option } = Select;

const FoodModal = ({ visible, onCancel, onSubmit, food, form }) => {
  return (
    <Modal
      title={`Add ${food?.name || "Food"}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {food && (
          <div className="mb-4">
            <div className="text-sm text-gray-500">
              {food.serving_size
                ? `Serving: ${food.serving_size}`
                : "Per serving:"}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Tag color="red">{food.calories} kcal</Tag>
              <Tag color="purple">Protein: {food.protein}g</Tag>
              <Tag color="blue">Carbs: {food.carbs}g</Tag>
              <Tag color="orange">Fat: {food.fats}g</Tag>
              {food.fiber && <Tag color="green">Fiber: {food.fiber}g</Tag>}
            </div>
          </div>
        )}

        <Form.Item
          name="mealType"
          label="Meal"
          rules={[{ required: true, message: "Please select a meal type" }]}
          initialValue="breakfast"
        >
          <Select placeholder="Select meal type">
            <Option value="breakfast">Breakfast</Option>
            <Option value="lunch">Lunch</Option>
            <Option value="dinner">Dinner</Option>
            <Option value="snack">Snack</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="servings"
          label="Servings"
          rules={[
            { required: true, message: "Please enter number of servings" },
          ]}
          initialValue={1}
        >
          <InputNumber
            min={0.1}
            max={10}
            step={0.1}
            precision={1}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <div className="flex justify-end">
          <Button onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Add to Log
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default FoodModal;
