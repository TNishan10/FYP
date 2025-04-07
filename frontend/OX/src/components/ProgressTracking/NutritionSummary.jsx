import React, { useState } from "react";
import { Card, Progress, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import FoodModal from "./FoodModal";
import { Form } from "antd";

const NutritionSummary = ({
  nutritionSummary,
  selectedDate,
  onAddFoodClick,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [form] = Form.useForm();

  // Function to handle add food button click
  const handleAddFood = () => {
    // If onAddFoodClick is provided, call it and don't show the modal
    if (onAddFoodClick) {
      onAddFoodClick();
      return; // Important: Exit early to prevent modal from opening
    }

    // Only show modal as fallback if no onAddFoodClick handler was provided
    setSelectedFood({
      // Default food values
      name: "Quick Add",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    });
    setModalVisible(true);
  };

  // Handle food submission
  const handleFoodSubmit = (values) => {
    console.log("Food added:", { ...selectedFood, ...values });
    setModalVisible(false);
    form.resetFields();
    // Normally we would update the nutrition data here
    // or call a function passed from the parent component
  };

  return (
    <>
      <Card
        title={
          <div className="flex items-center">
            <span className="text-lg font-bold">Daily Nutrition Summary</span>
            <span className="ml-auto text-sm text-gray-500">
              {selectedDate.format("MMMM D, YYYY")}
            </span>
          </div>
        }
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-4">Macronutrients</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Calories</span>
                  <span>
                    {nutritionSummary.calories.consumed} /{" "}
                    {nutritionSummary.calories.goal} kcal
                  </span>
                </div>
                <Progress
                  percent={Math.min(
                    100,
                    (nutritionSummary.calories.consumed /
                      nutritionSummary.calories.goal) *
                      100
                  )}
                  showInfo={false}
                  strokeColor="#f5222d"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Protein</span>
                  <span>
                    {nutritionSummary.protein.consumed}g /{" "}
                    {nutritionSummary.protein.goal}g
                  </span>
                </div>
                <Progress
                  percent={Math.min(
                    100,
                    (nutritionSummary.protein.consumed /
                      nutritionSummary.protein.goal) *
                      100
                  )}
                  showInfo={false}
                  strokeColor="#722ed1"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Carbohydrates</span>
                  <span>
                    {nutritionSummary.carbs.consumed}g /{" "}
                    {nutritionSummary.carbs.goal}g
                  </span>
                </div>
                <Progress
                  percent={Math.min(
                    100,
                    (nutritionSummary.carbs.consumed /
                      nutritionSummary.carbs.goal) *
                      100
                  )}
                  showInfo={false}
                  strokeColor="#1890ff"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Fats</span>
                  <span>
                    {nutritionSummary.fats.consumed}g /{" "}
                    {nutritionSummary.fats.goal}g
                  </span>
                </div>
                <Progress
                  percent={Math.min(
                    100,
                    (nutritionSummary.fats.consumed /
                      nutritionSummary.fats.goal) *
                      100
                  )}
                  showInfo={false}
                  strokeColor="#fa8c16"
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-4">Dietary Fiber</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Fiber</span>
                  <span>
                    {nutritionSummary.fiber.consumed}g /{" "}
                    {nutritionSummary.fiber.goal}g
                  </span>
                </div>
                <Progress
                  percent={Math.min(
                    100,
                    (nutritionSummary.fiber.consumed /
                      nutritionSummary.fiber.goal) *
                      100
                  )}
                  showInfo={false}
                  strokeColor="#52c41a"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleAddFood}
              >
                Add Food
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Only render the FoodModal if onAddFoodClick wasn't provided */}
      {!onAddFoodClick && (
        <FoodModal
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          onSubmit={handleFoodSubmit}
          food={selectedFood}
          form={form}
        />
      )}
    </>
  );
};

// Helper functions related to nutrition summary
export const calculateNutritionSummary = (foods, currentSummary) => {
  const summary = {
    calories: { consumed: 0, goal: currentSummary.calories.goal },
    protein: { consumed: 0, goal: currentSummary.protein.goal },
    carbs: { consumed: 0, goal: currentSummary.carbs.goal },
    fats: { consumed: 0, goal: currentSummary.fats.goal },
    fiber: { consumed: 0, goal: currentSummary.fiber.goal },
  };

  foods.forEach((food) => {
    summary.calories.consumed += food.calories * food.servings;
    summary.protein.consumed += food.protein * food.servings;
    summary.carbs.consumed += food.carbs * food.servings;
    summary.fats.consumed += food.fats * food.servings;
    if (food.fiber) {
      summary.fiber.consumed += food.fiber * food.servings;
    }
  });

  // Round to 1 decimal place
  summary.calories.consumed = Math.round(summary.calories.consumed * 10) / 10;
  summary.protein.consumed = Math.round(summary.protein.consumed * 10) / 10;
  summary.carbs.consumed = Math.round(summary.carbs.consumed * 10) / 10;
  summary.fats.consumed = Math.round(summary.fats.consumed * 10) / 10;
  summary.fiber.consumed = Math.round(summary.fiber.consumed * 10) / 10;

  return summary;
};

export const getDefaultNutritionSummary = () => ({
  calories: { consumed: 0, goal: 2000 },
  protein: { consumed: 0, goal: 150 },
  carbs: { consumed: 0, goal: 250 },
  fats: { consumed: 0, goal: 70 },
  fiber: { consumed: 0, goal: 30 },
});

export default NutritionSummary;
