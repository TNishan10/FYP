import React, { useState } from "react";
import { Table, Button, Space, Tag, Modal } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const { confirm } = Modal;

const UserTable = ({ users, loading, pagination, onChange, fetchUsers }) => {
  const showDeleteConfirm = (userId, userName) => {
    confirm({
      title: `Are you sure you want to delete ${userName}?`,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deleteUser(userId);
      },
    });
  };

  const deleteUser = async (userId) => {
    try {
      const token = sessionStorage.getItem("token");

      await axios.delete(`http://localhost:8000/api/v1/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "user_name",
      key: "name",
      sorter: (a, b) => a.user_name.localeCompare(b.user_name),
    },
    {
      title: "Email",
      dataIndex: "user_email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "green" : "blue"}>{role || "user"}</Tag>
      ),
      filters: [
        { text: "Admin", value: "admin" },
        { text: "User", value: "user" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Link to={`/admin/users/view?id=${record.user_id}`}>
            <Button type="primary" icon={<EyeOutlined />} size="small" />
          </Link>
          <Link to={`/admin/users/edit?id=${record.user_id}`}>
            <Button type="default" icon={<EditOutlined />} size="small" />
          </Link>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => showDeleteConfirm(record.user_id, record.user_name)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="user_id"
      loading={loading}
      pagination={pagination}
      onChange={onChange}
    />
  );
};

export default UserTable;
