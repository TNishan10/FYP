import React, { useState, useRef, useEffect } from "react";
import { Tabs, Spin, Form } from "antd";
import {
  FireOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import {  useNavigate } from "react-router-dom";

// Import all extracted components
import NutritionSummary, {
  calculateNutritionSummary,
  getDefaultNutritionSummary,
} from "../components/ProgressTracking/NutritionSummary";
import WeightHistory from "../components/ProgressTracking/WeightHistory";
import ExerciseLog from "../components/ProgressTracking/ExerciseLog";
import FoodModal from "../components/ProgressTracking/FoodModal";
import FoodSearch from "../components/ProgressTracking/FoodSearch";
import DailyFoodLog from "../components/ProgressTracking/DailyFoodLog";
import DateSelector from "../components/ProgressTracking/DateSelector";
import AuthRequiredMessage from "../components/ProgressTracking/AuthRequiredMessage";
import useProgressTrackingData from "../components/ProgressTracking/ProgressTrackingData";

const ProgressTracking = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const searchInputRef = useRef(null);

  // Use the extracted custom hook for main data management
  const {
    authError,
    userId,
    loading,
    selectedDate,
    dailyFoods,
    handleDateChange,
    fetchDailyFoods,
  } = useProgressTrackingData();

  // Process dailyFoods into nutritionSummary
  const [nutritionSummary, setNutritionSummary] = useState(
    getDefaultNutritionSummary()
  );

  // Update nutrition summary when daily foods change
  useEffect(() => {
    if (Array.isArray(dailyFoods)) {
      const summary = calculateNutritionSummary(
        dailyFoods,
        getDefaultNutritionSummary()
      );
      setNutritionSummary(summary);
    }
  }, [dailyFoods]);

  // States for food tracking
  const [searchQuery, setSearchQuery] = useState("");
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  // Add food to daily log
  const addFoodToDailyLog = async (values) => {
    try {
      // Call FoodModal's add function
      await form.validateFields();
      setFoodModalVisible(false);

      // Here we would normally call a function from FoodSearch or DailyFoodLog component
      // But for now, we'll just refresh the foods
      await fetchDailyFoods(userId, selectedDate);
    } catch (error) {
      console.error("Error in food submission:", error);
    }
  };

  // Handle food selection from search
  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setFoodModalVisible(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">
              Progress Tracking
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Monitor your nutrition, workouts, and body measurements
            </p>
          </div>

          {authError ? (
            <AuthRequiredMessage onLoginClick={() => navigate("/login")} />
          ) : (
            <>
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large" tip="Loading your data..." />
                </div>
              ) : (
                <Tabs
                  defaultActiveKey="1"
                  type="card"
                  className="bg-white rounded-lg shadow"
                  items={[
                    {
                      key: "1",
                      label: (
                        <span className="px-2 py-1">
                          <FireOutlined className="mr-2" />
                          Nutrition Tracking
                        </span>
                      ),
                      children: (
                        <div className="p-6">
                          {/* Nutrition Summary Component - Now with proper nutrition summary object */}
                          <NutritionSummary
                            nutritionSummary={nutritionSummary}
                            selectedDate={selectedDate}
                            onAddFoodClick={() => {
                              setSearchQuery("");
                              document
                                .getElementById("add-food-section")
                                ?.scrollIntoView({ behavior: "smooth" });
                              if (searchInputRef.current)
                                searchInputRef.current.focus();
                            }}
                          />

                          {/* Food Search Component */}
                          <FoodSearch
                            token={sessionStorage.getItem("token")}
                            onFoodSelect={handleFoodSelect}
                          />

                          {/* Daily Food Log Component */}
                          <DailyFoodLog
                            dailyFoods={dailyFoods || []}
                            selectedDate={selectedDate}
                            onRemoveFood={(logId) => {
                              // Implement removal logic or pass down to component
                              fetchDailyFoods(userId, selectedDate);
                            }}
                          />

                          {/* Food Modal */}
                          <FoodModal
                            visible={foodModalVisible}
                            onCancel={() => setFoodModalVisible(false)}
                            onSubmit={addFoodToDailyLog}
                            food={selectedFood}
                            form={form}
                          />
                        </div>
                      ),
                    },
                    {
                      key: "2",
                      label: (
                        <span className="px-2 py-1">
                          <BarChartOutlined className="mr-2" />
                          Exercise Tracking
                        </span>
                      ),
                      children: (
                        <ExerciseLog
                          userId={userId}
                          selectedDate={selectedDate}
                          token={sessionStorage.getItem("token")}
                        />
                      ),
                    },
                    {
                      key: "3",
                      label: (
                        <span className="px-2 py-1">
                          <LineChartOutlined className="mr-2" />
                          Weight Tracking
                        </span>
                      ),
                      children: (
                        <WeightHistory
                          userId={userId}
                          selectedDate={selectedDate}
                          token={sessionStorage.getItem("token")}
                        />
                      ),
                    },
                  ]}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProgressTracking;
