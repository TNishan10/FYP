import React, { useState } from "react";
import { Modal, Button, Typography, Space, message } from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const DeleteSupplement = ({ visible, onCancel, onSuccess, supplement }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to delete a supplement");
        return;
      }

      const response = await axios.delete(
        `http://localhost:8000/api/v1/auth/supplement/${supplement.supplement_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        message.success("Supplement deleted successfully!");
        if (onSuccess) onSuccess(supplement.supplement_id);
        onCancel();
      } else {
        throw new Error(
          response.data?.message || "Failed to delete supplement"
        );
      }
    } catch (error) {
      console.error("Error deleting supplement:", error);
      if (error.response) {
        console.error("Response error details:", {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        });
      }

      message.error(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while deleting the supplement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4}>Delete Supplement</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose={true}
    >
      <div style={{ marginBottom: 24 }}>
        <Text>
          Are you sure you want to delete the supplement "
          <strong>{supplement?.supplement_name}</strong>"? This action cannot be
          undone.
        </Text>
      </div>

      <div style={{ textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            danger
            loading={loading}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default DeleteSupplement;
