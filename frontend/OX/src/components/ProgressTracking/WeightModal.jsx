import React from "react";
import { Modal, Form, DatePicker, InputNumber, Button, Input } from "antd";

const WeightModal = ({ visible, onCancel, onSubmit, form, selectedDate }) => {
  return (
    <Modal title="Log Weight" open={visible} onCancel={onCancel} footer={null}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: "Please select a date" }]}
          initialValue={selectedDate}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="weight"
          label="Weight (kg)"
          rules={[{ required: true, message: "Please enter your weight" }]}
        >
          <InputNumber
            min={20}
            max={500}
            step={0.1}
            precision={1}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item name="notes" label="Notes (optional)">
          <Input.TextArea />
        </Form.Item>

        <div className="flex justify-end">
          <Button onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Save Entry
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default WeightModal;
