import React from "react";
import { Card, Button, Badge } from "antd";
import { StarFilled, EyeOutlined } from "@ant-design/icons";

/**
 * Featured program component that displays a highlighted training program
 * @param {Object} props - Component props
 * @param {Object} props.program - The featured program data
 * @param {Function} props.onView - Function to call when View button is clicked
 */
const FeaturedProgram = ({ program, onView }) => {
  if (!program) return null;

  return (
    <div className="featured-program relative">
      <Badge.Ribbon text="Featured" color="gold">
        <Card
          hoverable
          className="featured-card overflow-hidden"
          cover={
            program.image_url ? (
              <div
                className="h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${program.image_url})` }}
              />
            ) : (
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )
          }
        >
          <div className="absolute top-2 right-2">
            <StarFilled className="text-yellow-400 text-xl" />
          </div>

          <div className="card-content">
            <h2 className="text-xl font-bold mb-2">{program.title}</h2>

            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                {program.goal_type || "General Fitness"}
              </span>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                {program.difficulty || "All Levels"}
              </span>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">
              {program.description ||
                "A comprehensive training program designed to help you achieve your fitness goals."}
            </p>

            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => onView(program)}
              className="w-full"
            >
              View Program
            </Button>
          </div>
        </Card>
      </Badge.Ribbon>
    </div>
  );
};

export default FeaturedProgram;
