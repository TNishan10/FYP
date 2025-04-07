import React from "react";
import { Table, Button, Empty, Divider, Typography, Tag, Card } from "antd";
import {
  DeleteOutlined,
  CalendarOutlined,
  CoffeeOutlined,
  FireOutlined,
  RestOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Icons for each meal type
const MEAL_ICONS = {
  breakfast: <CoffeeOutlined style={{ fontSize: "18px" }} />,
  lunch: <FireOutlined style={{ fontSize: "18px" }} />,
  dinner: <RestOutlined style={{ fontSize: "18px" }} />,
  snack: <CalendarOutlined style={{ fontSize: "18px" }} />,
};

// Display text and style for each meal type
const MEAL_DISPLAY = {
  breakfast: { text: "Breakfast", color: "#1890ff" },
  lunch: { text: "Lunch", color: "#52c41a" },
  dinner: { text: "Dinner", color: "#722ed1" },
  snack: { text: "Snacks", color: "#faad14" },
};

const MealSection = ({ mealType, foods, onRemoveFood }) => {
  if (!foods || foods.length === 0) return null;

  const columns = [
    {
      title: "Food Item",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.brand && (
            <div className="text-xs text-gray-500">{record.brand}</div>
          )}
        </div>
      ),
    },
    {
      title: "Servings",
      dataIndex: "servings",
      key: "servings",
      width: 100,
      align: "center",
    },
    {
      title: "Calories",
      dataIndex: "calories",
      key: "calories",
      width: 100,
      render: (calories, record) =>
        `${Math.round(calories * record.servings)} kcal`,
    },
    {
      title: "Actions",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemoveFood(record.log_id)}
          aria-label="Remove food"
        />
      ),
    },
  ];

  const displayInfo = MEAL_DISPLAY[mealType] || {
    text: "Other",
    color: "#000000",
  };
  const icon = MEAL_ICONS[mealType];

  const totalCalories = foods.reduce(
    (sum, food) => sum + food.calories * food.servings,
    0
  );

  return (
    <Card
      className="mb-6"
      style={{ borderLeft: `4px solid ${displayInfo.color}` }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="mr-2">{icon}</span>
          <Title level={5} style={{ margin: 0, color: displayInfo.color }}>
            {displayInfo.text}
          </Title>
        </div>
        <Text type="secondary">{Math.round(totalCalories)} calories</Text>
      </div>
      <Table
        columns={columns}
        dataSource={foods}
        rowKey="log_id"
        pagination={false}
        size="small"
      />
    </Card>
  );
};

const DailyFoodLog = ({ dailyFoods, selectedDate, onRemoveFood }) => {
  // Group foods by meal type
  const foodsByMealType = React.useMemo(() => {
    const groups = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    if (dailyFoods && Array.isArray(dailyFoods)) {
      dailyFoods.forEach((food) => {
        const mealType = food.meal_type?.toLowerCase() || "snack";
        if (groups[mealType]) {
          groups[mealType].push(food);
        } else {
          groups.snack.push(food);
        }
      });
    }

    return groups;
  }, [dailyFoods]);

  // If no foods for the day
  if (!dailyFoods || dailyFoods.length === 0) {
    return (
      <div className="mt-8 text-center">
        <Empty
          description={
            <span>
              No food logged for {selectedDate.format("MMMM D, YYYY")}
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <Divider>
        <span className="text-lg font-medium">Your Food Log</span>
      </Divider>

      <MealSection
        mealType="breakfast"
        foods={foodsByMealType.breakfast}
        onRemoveFood={onRemoveFood}
      />

      <MealSection
        mealType="lunch"
        foods={foodsByMealType.lunch}
        onRemoveFood={onRemoveFood}
      />

      <MealSection
        mealType="dinner"
        foods={foodsByMealType.dinner}
        onRemoveFood={onRemoveFood}
      />

      <MealSection
        mealType="snack"
        foods={foodsByMealType.snack}
        onRemoveFood={onRemoveFood}
      />
    </div>
  );
};

export default DailyFoodLog;
