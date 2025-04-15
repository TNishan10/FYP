import React from "react";
import { Table, Button, Tooltip, Tag, Space, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  FilePdfOutlined,
} from "@ant-design/icons";

const ProgramsTable = ({
  programs,
  loading,
  onEdit,
  onDelete,
  onPreview,
  onSetFeatured,
}) => {
  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "green";
      case "intermediate":
        return "blue";
      case "advanced":
        return "orange";
      case "expert":
        return "red";
      default:
        return "default";
    }
  };

  const getGoalColor = (goal) => {
    switch (goal?.toLowerCase()) {
      case "strength":
        return "purple";
      case "hypertrophy":
        return "magenta";
      case "endurance":
        return "cyan";
      case "weight loss":
        return "green";
      case "general fitness":
        return "blue";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Goal",
      dataIndex: "goal_type",
      key: "goal_type",
      render: (goal) => (
        <Tag color={getGoalColor(goal)}>{goal || "Not specified"}</Tag>
      ),
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty_level",
      key: "difficulty_level",
      render: (level) => (
        <Tag color={getDifficultyColor(level)}>{level || "Not specified"}</Tag>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration_weeks",
      key: "duration_weeks",
      render: (weeks) => (weeks ? `${weeks} weeks` : "Not specified"),
    },
    {
      title: "Downloads",
      dataIndex: "download_count",
      key: "download_count",
      render: (count) => count || 0,
    },
    {
      title: "Featured",
      key: "is_featured",
      dataIndex: "is_featured",
      render: (featured, record) => (
        <Button
          type="text"
          icon={
            featured ? (
              <StarFilled style={{ color: "#faad14" }} />
            ) : (
              <StarOutlined />
            )
          }
          onClick={() => onSetFeatured(record.program_id)}
          title={featured ? "Featured Program" : "Set as featured"}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Preview">
            <Button
              icon={<EyeOutlined />}
              onClick={() => onPreview(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
              type="primary"
              ghost
            />
          </Tooltip>
          <Tooltip title="Generate PDF">
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => onPreview(record)}
              size="small"
              type="default"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this program?"
              onConfirm={() => onDelete(record.program_id)}
              okText="Yes"
              cancelText="No"
              placement="left"
            >
              <Button icon={<DeleteOutlined />} danger size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={programs}
      columns={columns}
      rowKey="program_id"
      loading={loading}
      scroll={{ x: 800 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50"],
      }}
    />
  );
};

export default ProgramsTable;
