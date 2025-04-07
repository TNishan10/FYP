import React from "react";
import { Modal, Form, Input, Button, Select, InputNumber } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

const FoodModal = ({ visible, onCancel, onSubmit, food, form, loading }) => {
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  React.useEffect(() => {
    if (visible && food) {
      // Set default meal type based on current time of day
      const currentHour = new Date().getHours();
      let defaultMealType = "snack";

      if (currentHour >= 5 && currentHour < 11) {
        defaultMealType = "breakfast";
      } else if (currentHour >= 11 && currentHour < 15) {
        defaultMealType = "lunch";
      } else if (currentHour >= 17 && currentHour < 22) {
        defaultMealType = "dinner";
      }

      form.setFieldsValue({
        meal_type: defaultMealType,
        servings: 1,
      });
    }
  }, [visible, food, form]);

  return (
    <Modal
      title={`Add ${food?.name || "Food"} to Daily Log`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          icon={<CheckCircleOutlined />}
        >
          Add to Log
        </Button>,
      ]}
    >
      {food && (
        <Form form={form} layout="vertical">
          <Form.Item
            name="meal_type"
            label="Meal Type"
            rules={[{ required: true, message: "Please select meal type" }]}
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
            label={`Number of Servings (${food.serving_size || "1 serving"})`}
            rules={[
              { required: true, message: "Please enter number of servings" },
            ]}
          >
            <InputNumber min={0.25} step={0.25} style={{ width: "100%" }} />
          </Form.Item>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-gray-700 font-medium mb-2">
              Nutrition Information (per serving)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Calories:</span> {food.calories}{" "}
                kcal
              </div>
              <div>
                <span className="font-medium">Protein:</span> {food.protein}g
              </div>
              <div>
                <span className="font-medium">Carbs:</span> {food.carbs}g
              </div>
              <div>
                <span className="font-medium">Fat:</span> {food.fats}g
              </div>
              {food.fiber && (
                <div>
                  <span className="font-medium">Fiber:</span> {food.fiber}g
                </div>
              )}
            </div>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default FoodModal;
