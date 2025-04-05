import React, { useState } from "react";
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
  Alert,
} from "antd";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const AddUser = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Custom validator for email domains
  const validateEmailDomain = (_, value) => {
    if (!value) return Promise.resolve(); // Let the required validator handle empty case

    const allowedDomains = ["gmail.com", "yahoo.com", "hotmail.com"];
    const domain = value.split("@")[1]?.toLowerCase();

    if (!domain || !allowedDomains.includes(domain)) {
      return Promise.reject(
        new Error("Email must end with @gmail.com, @yahoo.com, or @hotmail.com")
      );
    }

    return Promise.resolve();
  };

  // Check if email already exists
  const checkEmailExists = async (email) => {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) return false;

      const response = await axios.get(
        `http://localhost:8000/api/v1/auth/users?email=${encodeURIComponent(
          email
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If we get any users back with this email, it exists
      return (
        response.data &&
        response.data.data &&
        response.data.data.some(
          (user) => user.user_email.toLowerCase() === email.toLowerCase()
        )
      );
    } catch (error) {
      console.error("Error checking email:", error);
      return false; // Assume email doesn't exist if check fails
    }
  };

  // Email validator with additional check
  const validateEmail = async (_, value) => {
    if (!value) return Promise.resolve();

    // First check domain
    try {
      await validateEmailDomain(_, value);
    } catch (error) {
      return Promise.reject(error);
    }

    // Then check if email exists
    const exists = await checkEmailExists(value);
    if (exists) {
      return Promise.reject(
        new Error("This email is already in use. Please use a different email.")
      );
    }

    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to create a user");
        return;
      }

      // Password validation
      if (values.password.length < 8) {
        message.error("Password must be at least 8 characters");
        setLoading(false);
        return;
      }

      // Prepare data for API
      const userData = {
        user_name: values.name,
        user_email: values.email,
        password: values.password,
        user_role: values.role,
        is_verified: values.verified,
        account_status: values.status,
      };

      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/users/admin/create",
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        message.success("User created successfully!");
        form.resetFields();
        if (onSuccess) onSuccess(response.data.data);
        onCancel();
      } else {
        throw new Error(response.data?.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);

      // Handle different types of errors
      if (error.response?.status === 409) {
        setError(
          "This email is already in use. Please use a different email address."
        );
        form.setFields([
          {
            name: "email",
            errors: [
              "This email is already in use. Please use a different email address.",
            ],
          },
        ]);
      } else {
        setError(
          error.response?.data?.message ||
            error.message ||
            "An error occurred while creating the user"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4}>Add New User</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose={true}
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setError(null)}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          role: "user",
          verified: false,
          status: "active",
        }}
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Please enter user's full name" }]}
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
          rules={[
            { required: true, message: "Please enter password" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
        >
          <Input.Password placeholder="Enter password" />
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
              Create User
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUser;
