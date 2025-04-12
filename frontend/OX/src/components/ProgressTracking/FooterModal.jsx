import React from "react";

const FooterModal = () => {
  return (
    <div>
      <Modal
        title={`Add ${selectedFood?.name || "Food"}`}
        open={foodModalVisible}
        onCancel={() => setFoodModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={addFoodToDailyLog}>
          {selectedFood && (
            <div className="mb-4">
              <div className="text-sm text-gray-500">
                {selectedFood.serving_size
                  ? `Serving: ${selectedFood.serving_size}`
                  : "Per serving:"}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Tag color="red">{selectedFood.calories} kcal</Tag>
                <Tag color="purple">Protein: {selectedFood.protein}g</Tag>
                <Tag color="blue">Carbs: {selectedFood.carbs}g</Tag>
                <Tag color="orange">Fat: {selectedFood.fats}g</Tag>
                {selectedFood.fiber && (
                  <Tag color="green">Fiber: {selectedFood.fiber}g</Tag>
                )}
              </div>
            </div>
          )}

          <Form.Item
            name="mealType"
            label="Meal"
            rules={[{ required: true, message: "Please select a meal type" }]}
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
            <InputNumber min={0.1} step={0.1} style={{ width: "100%" }} />
          </Form.Item>

          <div className="flex justify-end">
            <Button onClick={() => setFoodModalVisible(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Add to Log
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FooterModal;
