import React, { useState } from "react";
import { Table, Button, Space, Tag, Modal, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { deleteTrainingProgram } from "../../utils/trainingProgramsService";
import { getFullImageUrl } from "../../utils/imageHelper";

const ProgramsTable = ({ programs, loading, onEdit, onDelete }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (programId) => {
    try {
      console.log("Delete request initiated for program ID:", programId);
      setDeleteLoading(true);
      setDeletingId(programId);

      const result = await deleteTrainingProgram(programId);

      if (result.success) {
        onDelete(programId);
      }
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image_url",
      render: (url, record) => {
        // Determine the best image URL to use
        const imageSource =
          url ||
          (record.original_image_url &&
          record.original_image_url !== "undefined"
            ? getFullImageUrl(record.original_image_url)
            : null);

        if (!imageSource) {
          return (
            <div
              style={{
                width: 50,
                height: 50,
                background: "#f0f0f0",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              No image
            </div>
          );
        }

        return (
          <img
            src={imageSource}
            alt={record.title || "Program image"}
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: "4px",
            }}
            onError={(e) => {
              console.error("Image failed to load:", imageSource);
              e.target.onerror = null;
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Crect width='50' height='50' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='8' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
        );
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Goal Type",
      dataIndex: "goal_type",
      key: "goal_type",
      render: (goal_type) => (
        <Tag
          color={
            goal_type === "hypertrophy"
              ? "#f50"
              : goal_type === "strength"
              ? "#722ed1"
              : goal_type === "cardio"
              ? "#1890ff"
              : goal_type === "endurance"
              ? "#52c41a"
              : goal_type === "crossfit"
              ? "#faad14"
              : goal_type === "hybrid"
              ? "#13c2c2"
              : "#108ee9"
          }
        >
          {goal_type}
        </Tag>
      ),
      filters: [
        { text: "Hypertrophy", value: "hypertrophy" },
        { text: "Strength", value: "strength" },
        { text: "Cardio", value: "cardio" },
        { text: "Endurance", value: "endurance" },
        { text: "CrossFit", value: "crossfit" },
        { text: "Hybrid", value: "hybrid" },
      ],
      onFilter: (value, record) => record.goal_type === value,
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
      render: (difficulty) => (
        <Tag
          color={
            difficulty === "beginner"
              ? "green"
              : difficulty === "intermediate"
              ? "blue"
              : difficulty === "advanced"
              ? "purple"
              : "red"
          }
        >
          {difficulty}
        </Tag>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Featured",
      dataIndex: "featured",
      key: "featured",
      render: (featured) =>
        featured ? (
          <Tag color="gold">Featured</Tag>
        ) : (
          <Tag color="default">No</Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            loading={deleteLoading && deletingId === record.program_id}
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();

              Modal.confirm({
                title: `Delete "${record.title || "this program"}"?`,
                content: "This action cannot be undone.",
                okText: "Yes, Delete",
                okType: "danger",
                cancelText: "Cancel",
                onOk: () => handleDelete(record.program_id),
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      dataSource={programs}
      columns={columns}
      rowKey="program_id"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default ProgramsTable;
