import React, { useState, useEffect } from "react";
import { Table, Typography, Button, Space, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import AddUser from "../../components/admin/Users/AddUser";
import EditUser from "../../components/admin/Users/EditUser";
import DeleteUser from "../../components/admin/Users/DeleteUser";

const { Title, Text } = Typography;

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

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
        setPagination((prev) => ({
          ...prev,
          total:
            response.data.pagination?.total_count || response.data.data.length,
        }));
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

  const handleAddSuccess = (newUser) => {
    // Add the new user to the list without fetching again
    setUsers((prev) => {
      const updatedUsers = [newUser, ...prev];
      window.dispatchEvent(
        new CustomEvent("user-data-change", {
          detail: {
            type: "add",
            count: updatedUsers.length,
          },
        })
      );

      return updatedUsers;
    });

    setPagination((prev) => ({
      ...prev,
      total: prev.total + 1,
    }));

    message.success("User added successfully!");
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalVisible(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalVisible(true);
  };

  const handleEditSuccess = (updatedUser) => {
    // Update user in the list without refetching
    setUsers((prev) =>
      prev.map((user) =>
        user.user_id === updatedUser.user_id ? updatedUser : user
      )
    );
    message.success("User updated successfully!");
  };

  const handleDeleteSuccess = (deletedId) => {
    // Remove the deleted user from the list
    setUsers((prev) => {
      const updatedUsers = prev.filter((user) => user.user_id !== deletedId);

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("user-data-change", {
          detail: {
            type: "delete",
            count: updatedUsers.length,
          },
        })
      );

      return updatedUsers;
    });

    setPagination((prev) => ({
      ...prev,
      total: prev.total - 1,
    }));

    message.success("User deleted successfully!");
  };

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
      render: (role) => (
        <span style={{ textTransform: "capitalize" }}>{role}</span>
      ),
    },
    {
      title: "Account Status",
      dataIndex: "account_status",
      key: "account_status",
      render: (status) => (
        <span
          style={{
            textTransform: "capitalize",
            color:
              status === "active"
                ? "green"
                : status === "inactive"
                ? "orange"
                : "red",
          }}
        >
          {status}
        </span>
      ),
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
          <Button type="primary" onClick={() => handleEditClick(record)}>
            Edit
          </Button>
          <Button danger onClick={() => handleDeleteClick(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4}>Users Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          Add User
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Showing {pagination.pageSize} users per page. Use the pagination
          controls below to view more users.
        </Text>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="user_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`,
        }}
        onChange={(pagination) => setPagination(pagination)}
        loading={loading && users.length === 0}
      />

      <AddUser
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <EditUser
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        user={selectedUser}
      />

      <DeleteUser
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onSuccess={handleDeleteSuccess}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersAdmin;
