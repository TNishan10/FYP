import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Modal, Card, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AdminLayout from "../../../components/AdminComponents/AdminLayout";

const { confirm } = Modal;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:8000/api/v1/auth/users?page=${pagination.current}&limit=${pagination.pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUsers(response.data.data);
        setPagination({
          ...pagination,
          total: response.data.total || response.data.data.length,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

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
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          String(record.user_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.user_email).toLowerCase().includes(value.toLowerCase())
        );
      },
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
    <AdminLayout selectedKey="users">
      <div>
        <h1 className="text-2xl font-bold mb-6">User Management</h1>

        <Card className="mb-6">
          <div className="mb-4 flex justify-between items-center">
            <Input
              placeholder="Search by name or email"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: 300 }}
              allowClear
            />
            <Link to="/admin/users/edit">
              <Button type="primary" icon={<UserAddOutlined />}>
                Add New User
              </Button>
            </Link>
          </div>

          <Table
            columns={columns}
            dataSource={users}
            rowKey="user_id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
