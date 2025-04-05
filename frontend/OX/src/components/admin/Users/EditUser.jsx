import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Switch,
  message,
  Typography,
  Space,
  Divider,
} from "antd";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const EditUser = ({ visible, onCancel, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);

  // Don't create the form instance until it's needed
  const [form] = Form.useForm();

  // Custom validator for email domains
  const validateEmailDomain = (_, value) => {
    if (!value) return Promise.resolve();
    if (user && value === user.user_email) return Promise.resolve(); // Allow unchanged email

    const allowedDomains = ["gmail.com", "yahoo.com", "hotmail.com"];
    const domain = value.split("@")[1]?.toLowerCase();

    if (!domain || !allowedDomains.includes(domain)) {
      return Promise.reject(
        new Error("Email must end with @gmail.com, @yahoo.com, or @hotmail.com")
      );
    }

    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to update a user");
        setLoading(false);
        return;
      }

      // Prepare data for API
      const userData = {
        user_name: values.name,
        user_email: values.email,
        user_role: values.role,
        is_verified: values.verified,
        account_status: values.status,
      };

      // Only include password if provided
      if (values.password && values.password.trim()) {
        if (values.password.length < 8) {
          message.error("Password must be at least 8 characters");
          setLoading(false);
          return;
        }
        userData.password = values.password;
      }

      const response = await axios.put(
        `http://localhost:8000/api/v1/auth/users/${user.user_id}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        message.success("User updated successfully!");
        if (onSuccess) onSuccess({ ...user, ...userData });
        onCancel();
      } else {
        throw new Error(response.data?.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while updating the user"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form when the modal opens or closes
  useEffect(() => {
    if (visible) {
      // Use form.resetFields() after the form is guaranteed to be mounted
      form.resetFields();
    }
  }, [visible, form]);

  // Create initial form values from user object
  const getInitialValues = () => {
    if (!user) return {};

    return {
      name: user.user_name,
      email: user.user_email,
      role: user.user_role,
      verified: user.is_verified,
      status: user.account_status,
    };
  };

  return (
    <Modal
      title={<Title level={4}>Edit User</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose={true} // This ensures the form is destroyed and recreated each time
      forceRender={true} // This ensures the form is pre-rendered
    >
      {/* Only render the form when visible */}
      {visible && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={getInitialValues()}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: "Please enter user's full name" },
            ]}
          >
            <Input placeholder="Enter user's full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Please enter a valid email address" },
              { validator: validateEmailDomain },
            ]}
            extra="Only @gmail.com, @yahoo.com and @hotmail.com addresses allowed"
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            extra="Leave blank to keep current password"
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Divider />

          <Form.Item name="role" label="User Role">
            <Select>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
              <Option value="trainer">Trainer</Option>
            </Select>
          </Form.Item>

          <Space size="large" style={{ display: "flex" }}>
            <Form.Item
              name="verified"
              label="Email Verified"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item name="status" label="Account Status">
              <Select style={{ width: 120 }}>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="suspended">Suspended</Option>
              </Select>
            </Form.Item>
          </Space>

          <Divider />

          <Form.Item style={{ marginTop: 24, textAlign: "right" }}>
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EditUser;
