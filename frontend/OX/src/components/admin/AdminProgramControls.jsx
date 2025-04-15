import React from "react";
import { Button, Tooltip, Popconfirm, Space, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

/**
 * Administrative controls for training programs
 * @param {Object} props - Component props
 * @param {Object} props.program - Program data when used for a specific program
 * @param {Function} props.onEdit - Handler for edit action
 * @param {Function} props.onDelete - Handler for delete action
 * @param {Function} props.onSetFeatured - Handler for setting as featured
 * @param {Function} props.onPreview - Handler for previewing a program
 * @param {Function} props.onAddNew - Handler for adding a new program
 * @param {string} props.mode - 'list' for list item controls, 'detail' for detailed view controls, 'new' for just the add button
 */
const AdminProgramControls = ({
  program,
  onEdit,
  onDelete,
  onSetFeatured,
  onPreview,
  onAddNew,
  mode = "list",
}) => {
  // Handler for setting a program as featured
  const handleSetFeatured = async () => {
    try {
      await api.trainingPrograms.setFeatured(program.program_id);
      message.success(`"${program.title}" set as featured program`);
      if (onSetFeatured) onSetFeatured(program.program_id);
    } catch (error) {
      console.error("Error setting program as featured:", error);
      message.error("Failed to set program as featured");
    }
  };

  // If mode is 'new', just show the add button
  if (mode === "new") {
    return (
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onAddNew}
        className="create-program-btn"
      >
        Create Program
      </Button>
    );
  }

  // For list or detail modes, show program-specific controls
  return (
    <Space className="admin-program-controls">
      {/* Edit button */}
      <Tooltip title="Edit Program">
        <Button
          icon={<EditOutlined />}
          onClick={() => onEdit(program)}
          size={mode === "detail" ? "middle" : "small"}
          className="edit-program-btn"
        />
      </Tooltip>

      {/* Preview button */}
      <Tooltip title="Preview Program">
        <Button
          icon={<EyeOutlined />}
          onClick={() => onPreview(program)}
          size={mode === "detail" ? "middle" : "small"}
          className="preview-program-btn"
        />
      </Tooltip>

      {/* Set Featured button */}
      <Tooltip
        title={program.is_featured ? "Featured Program" : "Set as Featured"}
      >
        <Button
          icon={
            program.is_featured ? (
              <StarFilled className="text-yellow-500" />
            ) : (
              <StarOutlined />
            )
          }
          onClick={handleSetFeatured}
          disabled={program.is_featured}
          size={mode === "detail" ? "middle" : "small"}
          className="feature-program-btn"
        />
      </Tooltip>

      {/* Delete button with confirmation */}
      <Popconfirm
        title="Delete this program?"
        description="This action cannot be undone."
        onConfirm={() => onDelete(program.program_id)}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <Tooltip title="Delete Program">
          <Button
            danger
            icon={<DeleteOutlined />}
            size={mode === "detail" ? "middle" : "small"}
            className="delete-program-btn"
          />
        </Tooltip>
      </Popconfirm>
    </Space>
  );
};

export default AdminProgramControls;
