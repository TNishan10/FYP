import React from "react";
import { Form, Input, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const HighlightsSection = ({ highlightsCount, setHighlightsCount }) => {
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-2">
        <label className="font-medium">Program Highlights</label>
        <Button
          type="dashed"
          onClick={() => setHighlightsCount((prev) => prev + 1)}
          icon={<PlusOutlined />}
        >
          Add Highlight
        </Button>
      </div>

      {[...Array(highlightsCount)].map((_, index) => (
        <Form.Item
          key={`highlights[${index}]`}
          name={["highlights", index]}
          rules={
            index === 0
              ? [
                  {
                    required: true,
                    message: "Please enter at least one highlight",
                  },
                ]
              : []
          }
        >
          <Input placeholder={`Program highlight ${index + 1}`} />
        </Form.Item>
      ))}
    </div>
  );
};

export default HighlightsSection;
