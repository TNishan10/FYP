import React from "react";
import { DatePicker } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const DateSelector = ({ selectedDate, onDateChange }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-8 flex justify-between items-center">
      <div className="flex items-center">
        <CalendarOutlined className="text-xl text-blue-500 mr-3" />
        <span className="font-medium">Selected Date:</span>
      </div>
      <DatePicker
        value={selectedDate}
        onChange={onDateChange}
        allowClear={false}
        format="MMMM D, YYYY"
      />
    </div>
  );
};

export default DateSelector;
