import React from "react";
import { Card, Table, Empty, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const DailyFoodLog = ({ dailyFoods, selectedDate, onRemoveFood }) => {
  // Food tracking columns for table
  const foodColumns = [
    {
      title: "Food",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Servings",
      dataIndex: "servings",
      key: "servings",
      width: 100,
    },
    {
      title: "Calories",
      dataIndex: "calories",
      key: "calories",
      width: 100,
      render: (text, record) => Math.round(text * record.servings),
    },
    {
      title: "Protein",
      dataIndex: "protein",
      key: "protein",
      width: 100,
      render: (text, record) => `${Math.round(text * record.servings)}g`,
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemoveFood(record.log_id)}
        />
      ),
    },
  ];

  // Helper function to render meal sections
  const renderMealSection = (title, mealType) => {
    const mealFoods = dailyFoods.filter((food) => food.meal_type === mealType);

    if (mealFoods.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="font-medium text-lg mb-2">{title}</h4>
        <Table
          columns={foodColumns}
          dataSource={mealFoods}
          rowKey="log_id"
          pagination={false}
          size="small"
        />
      </div>
    );
  };

  return (
    <Card
      title={
        <span className="text-lg font-medium">
          Daily Food Log - {selectedDate.format("MMMM D, YYYY")}
        </span>
      }
      className="mb-6"
    >
      {dailyFoods.length === 0 ? (
        <Empty description="No foods logged for this day" />
      ) : (
        <>
          {renderMealSection("Breakfast", "breakfast")}
          {renderMealSection("Lunch", "lunch")}
          {renderMealSection("Dinner", "dinner")}
          {renderMealSection("Snacks", "snack")}
        </>
      )}
    </Card>
  );
};

export default DailyFoodLog;
