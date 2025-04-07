import React, { useState, useRef, useEffect } from "react";
import { Form, Tabs, Spin, message } from "antd";
import {
  FireOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

// Import components
import DateSelector from "../components/ProgressTracking/DateSelector";
import NutritionSummary, {
  calculateNutritionSummary,
  getDefaultNutritionSummary,
} from "../components/ProgressTracking/NutritionSummary";
import FoodSearch from "../components/ProgressTracking/foodSearch";
import DailyFoodLog from "../components/ProgressTracking/DailyFoodLog";
import FoodModal from "../components/ProgressTracking/FoodModal";
import ExerciseLog from "../components/ProgressTracking/ExerciseLog";
import WeightHistory from "../components/ProgressTracking/WeightHistory";
import AuthRequiredMessage from "../components/ProgressTracking/AuthRequiredMessage";
import { useProgressTrackingData } from "../hooks/useProgressTrackingData";

const ProgressTracking = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const searchInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // For forcing component refreshes

  // Use the extracted custom hook for main data management
  const {
    authError,
    userId,
    isLoading,
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

  // Add food to daily log with proper ID handling
  const addFoodToDailyLog = async (values) => {
    try {
      setLoading(true);
      // Validate form values
      await form.validateFields();

      // Get token with fallback
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to add food");
        setLoading(false);
        return;
      }

      // Close modal and show loading message
      setFoodModalVisible(false);
      message.loading("Adding food to your log...", 0.5);

      // Process food_id to ensure it's a numeric value
      let processedFoodId;

      if (selectedFood.food_id) {
        const foodIdStr = String(selectedFood.food_id);

        if (foodIdStr.startsWith("usda_")) {
          // Extract the numeric part after 'usda_'
          const usdaId = foodIdStr.replace("usda_", "");

          // Add the USDA food to our database first
          try {
            const addFoodResponse = await axios.post(
              `http://localhost:8000/api/v1/auth/nutrition/foods/add`,
              {
                name: selectedFood.name,
                brand: selectedFood.brand || "USDA Database",
                serving_size: selectedFood.serving_size || "100g",
                calories: selectedFood.calories || 0,
                protein: selectedFood.protein || 0,
                carbs: selectedFood.carbs || 0,
                fats: selectedFood.fats || 0,
                fiber: selectedFood.fiber || 0,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (addFoodResponse.data && addFoodResponse.data.success) {
              // Use the new food ID
              processedFoodId = addFoodResponse.data.data.food_id;
              console.log(
                "Added USDA food to database with ID:",
                processedFoodId
              );
            } else {
              throw new Error("Failed to add USDA food to database");
            }
          } catch (addError) {
            console.error("Error adding USDA food:", addError);
            // If we fail to add the food, try using the numeric ID directly
            processedFoodId = parseInt(usdaId, 10);
          }
        } else {
          // For regular foods, just parse as integer
          processedFoodId = parseInt(foodIdStr, 10);
        }

        // Validate we have a valid numeric ID
        if (isNaN(processedFoodId)) {
          message.error("Invalid food ID format. Please try another food.");
          setLoading(false);
          return;
        }
      } else {
        message.error("No food ID available. Please select a valid food.");
        setLoading(false);
        return;
      }

      // Send the food log data with the processed numeric food_id
      const foodData = {
        food_id: processedFoodId,
        date: selectedDate.format("YYYY-MM-DD"),
        meal_type: values.meal_type || "snack",
        servings: parseFloat(values.servings) || 1,
      };

      console.log("Sending food payload:", foodData);
      console.log("Using token:", token.substring(0, 10) + "...");

      const response = await axios.post(
        `http://localhost:8000/api/v1/auth/nutrition/daily-log/${userId}/add`,
        foodData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        message.success("Food added successfully!");
        form.resetFields();
        setSelectedFood(null);

        // More reliable data refresh approach
        try {
          // Direct axios call to get the latest data
          const foodLogResponse = await axios.get(
            `http://localhost:8000/api/v1/auth/nutrition/daily-log/${userId}`,
            {
              params: { date: selectedDate.format("YYYY-MM-DD") },
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // If we get data back, manually update the state that displays foods
          if (foodLogResponse.data && foodLogResponse.data.success) {
            await fetchDailyFoods(userId, selectedDate);

            // Force re-render by updating the refresh key
            setRefreshKey((prevKey) => prevKey + 1);
          } else {
            console.error("Failed to refresh food log data");
          }
        } catch (refreshError) {
          console.error("Error refreshing food data:", refreshError);
        }
      } else {
        throw new Error(response.data?.message || "Failed to add food");
      }
    } catch (error) {
      console.error("Error adding food:", error);

      // Log the full error response for debugging
      if (error.response) {
        console.error("Server response:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
      }

      // Show specific error message based on response
      if (error.response?.status === 401) {
        message.error("Authentication required. Please log in again.");
      } else if (error.response?.status === 403) {
        message.error("You don't have permission to add food");
      } else if (error.response?.status === 500) {
        message.error(
          `Server error: ${error.response.data?.message || "Unknown error"}`
        );
      } else {
        message.error(
          "Failed to add food to your log: " +
            (error.message || "Unknown error")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle food selection from search
  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setFoodModalVisible(true);
  };

  // Handle removing food from log
  const handleRemoveFood = async (logId) => {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to remove food");
        return;
      }

      const response = await axios.delete(
        `http://localhost:8000/api/v1/auth/nutrition/daily-log/${userId}/remove/${logId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        message.success("Food removed successfully!");
        await fetchDailyFoods(userId, selectedDate);
        setRefreshKey((prevKey) => prevKey + 1); // Force re-render
      } else {
        throw new Error(response.data?.message || "Failed to remove food");
      }
    } catch (error) {
      console.error("Error removing food:", error);
      message.error("Failed to remove food from your log");
    }
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

              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-64">
                  <Spin size="large" />
                  <p className="mt-4 text-gray-600">Loading your data...</p>
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
                          {/* Nutrition Summary Component */}
                          <NutritionSummary
                            nutritionSummary={nutritionSummary}
                            selectedDate={selectedDate}
                            onAddFoodClick={() => {
                              setSearchQuery && setSearchQuery(""); // Clear search query if it exists

                              // Scroll to the search section with offset
                              const searchSection =
                                document.getElementById("add-food-section");
                              if (searchSection) {
                                // Scroll with offset to account for fixed headers if any
                                const offset = 100;
                                const topPos =
                                  searchSection.getBoundingClientRect().top +
                                  window.pageYOffset -
                                  offset;

                                window.scrollTo({
                                  top: topPos,
                                  behavior: "smooth",
                                });
                              }

                              // Focus with slight delay to allow scroll to complete
                              setTimeout(() => {
                                if (searchInputRef.current) {
                                  searchInputRef.current.focus();
                                }
                              }, 500);
                            }}
                          />

                          {/* Food Search Component */}
                          <div id="add-food-section">
                            <FoodSearch
                              ref={searchInputRef}
                              token={sessionStorage.getItem("token")}
                              onFoodSelect={handleFoodSelect}
                            />
                          </div>

                          {/* Daily Food Log Component */}
                          <DailyFoodLog
                            key={refreshKey} // Add this to force re-render
                            dailyFoods={dailyFoods || []}
                            selectedDate={selectedDate}
                            onRemoveFood={handleRemoveFood}
                          />

                          {/* Food Modal */}
                          <FoodModal
                            visible={foodModalVisible}
                            onCancel={() => setFoodModalVisible(false)}
                            onSubmit={addFoodToDailyLog}
                            food={selectedFood}
                            form={form}
                            loading={loading}
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
