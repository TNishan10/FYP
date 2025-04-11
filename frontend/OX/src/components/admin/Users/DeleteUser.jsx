import React, { useState } from "react";
import { Modal, Typography, Button, Space, message, Alert } from "antd";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

const DeleteUser = ({ visible, onCancel, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to delete a user");
        return;
      }

      const response = await axios.delete(
        `http://localhost:8000/api/v1/auth/users/${user.user_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        message.success("User permanently deleted!");
        if (onSuccess) onSuccess(user.user_id);
        onCancel();
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);

      // Set a more specific error message based on the response
      let errorMessage = "An error occurred while deleting the user";

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage =
            "User not found. The user may have been already deleted.";
        } else if (error.response.status === 500) {
          errorMessage =
            "Server error: Unable to delete this user. Please contact the administrator.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4}>Delete User</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <div style={{ marginBottom: 24 }}>
        <Text>
          Are you sure you want to permanently delete user{" "}
          <strong>{user?.user_name}</strong> ({user?.user_email})?
          {!error && " This action cannot be undone."}
        </Text>
      </div>

      {error && (
        <Alert
          message="Operation Failed"
          description={
            <>
              <Paragraph>{error}</Paragraph>
              <Paragraph>
                Please try again later or contact the system administrator.
              </Paragraph>
            </>
          }
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <div style={{ textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          {error ? (
            <Button type="primary" onClick={onCancel}>
              Close
            </Button>
          ) : (
            <Button
              type="primary"
              danger
              loading={loading}
              onClick={handleDelete}
            >
              Delete Permanently
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
};

export default DeleteUser;
