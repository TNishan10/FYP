import React, { useState, useEffect } from "react";
import { Table, Typography, Button, Space } from "antd";
import axios from "axios";

const { Title } = Typography;

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view users.");
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/api/v1/auth/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.data) {
          setUsers(response.data.data);
        } else {
          setError("No users found.");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "user_name",
      key: "user_name",
    },
    {
      title: "Email",
      dataIndex: "user_email",
      key: "user_email",
    },
    {
      title: "Role",
      dataIndex: "user_role",
      key: "user_role",
    },
    {
      title: "Account Status",
      dataIndex: "account_status",
      key: "account_status",
    },
    {
      title: "Verified",
      dataIndex: "is_verified",
      key: "is_verified",
      render: (is_verified) => (is_verified ? "Yes" : "No"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary">Edit</Button>
          <Button type="danger">Delete</Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Title level={4}>Users Management</Title>
      <Table dataSource={users} columns={columns} rowKey="user_id" />
    </div>
  );
};

export default UsersAdmin;
