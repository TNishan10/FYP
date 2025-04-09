import React from "react";
import { Radio, Tooltip } from "antd";
import {
  FireOutlined,
  RocketOutlined,
  HeartOutlined,
  FieldTimeOutlined,
  AimOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const goalTypes = [
  {
    value: "all",
    label: "All Programs",
    icon: <AppstoreOutlined />,
    tooltip: "View all training programs",
  },
  {
    value: "hypertrophy",
    label: "Muscle Growth",
    icon: <FireOutlined />,
    tooltip: "Focus on muscle size and definition",
  },
  {
    value: "strength",
    label: "Strength",
    icon: <RocketOutlined />,
    tooltip: "Maximize power and strength gains",
  },
  {
    value: "cardio",
    label: "Cardiovascular",
    icon: <HeartOutlined />,
    tooltip: "Improve heart health and stamina",
  },
  {
    value: "endurance",
    label: "Endurance",
    icon: <FieldTimeOutlined />,
    tooltip: "Build muscular endurance and stamina",
  },
  {
    value: "crossfit",
    label: "CrossFit",
    icon: <AimOutlined />,
    tooltip: "High-intensity functional training",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    icon: <ThunderboltOutlined />,
    tooltip: "Balanced approach to multiple fitness goals",
  },
];

const ProgramFilter = ({ selectedGoal, onSelectGoal }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-medium mb-4 text-gray-800">
        Filter by Training Goal
      </h3>

      <Radio.Group
        value={selectedGoal}
        onChange={(e) => onSelectGoal(e.target.value)}
        buttonStyle="solid"
        className="flex flex-wrap gap-2"
      >
        {goalTypes.map((goal) => (
          <Tooltip key={goal.value} title={goal.tooltip}>
            <Radio.Button
              value={goal.value}
              className="flex items-center px-4 py-2"
            >
              <span className="mr-2">{goal.icon}</span>
              {goal.label}
            </Radio.Button>
          </Tooltip>
        ))}
      </Radio.Group>
    </div>
  );
};

export default ProgramFilter;
