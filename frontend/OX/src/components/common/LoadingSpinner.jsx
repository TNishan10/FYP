import React from "react";
import { Spin } from "antd";

/**
 * Reusable loading spinner component with customizable size and message
 * @param {Object} props - Component props
 * @param {string} [props.size='large'] - Size of the spinner ('small', 'default', 'large')
 * @param {string} [props.message='Loading...'] - Message to display below spinner
 * @param {string} [props.className=''] - Additional CSS classes
 */
const LoadingSpinner = ({
  size = "large",
  message = "Loading...",
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-8 ${className}`}
    >
      <Spin size={size} />
      {message && <p className="mt-4 text-gray-500">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
