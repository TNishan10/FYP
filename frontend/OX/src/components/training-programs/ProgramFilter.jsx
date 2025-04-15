import React from "react";
import { Radio, Card } from "antd";

// Goal type options with icons/emoji
const GOAL_TYPES = [
  { value: "all", label: "All Programs", icon: "🔍" },
  { value: "strength", label: "Strength", icon: "💪" },
  { value: "hypertrophy", label: "Hypertrophy", icon: "🏋️" },
  { value: "endurance", label: "Endurance", icon: "🏃" },
  { value: "weight-loss", label: "Weight Loss", icon: "⚖️" },
  { value: "general-fitness", label: "General Fitness", icon: "🌟" },
];

/**
 * Filter component for training programs by goal type
 * @param {Object} props - Component props
 * @param {string} props.selectedGoal - Currently selected goal value
 * @param {Function} props.onSelectGoal - Callback when a goal is selected
 */
const ProgramFilter = ({ selectedGoal, onSelectGoal }) => {
  return (
    <Card className="program-filter shadow-sm">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold">Filter by Goal</h2>
      </div>

      <Radio.Group
        value={selectedGoal}
        onChange={(e) => onSelectGoal(e.target.value)}
        buttonStyle="solid"
        className="w-full flex flex-wrap justify-center gap-2"
      >
        {GOAL_TYPES.map((goal) => (
          <Radio.Button
            key={goal.value}
            value={goal.value}
            className="mb-2 text-center"
          >
            <span className="mr-1">{goal.icon}</span> {goal.label}
          </Radio.Button>
        ))}
      </Radio.Group>
    </Card>
  );
};

export default ProgramFilter;
