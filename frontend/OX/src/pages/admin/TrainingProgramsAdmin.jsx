import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  Button,
  Space,
  message,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Upload,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
// Import the API_URL from config
import { API_URL } from "../../config";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TrainingProgramsAdmin = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [form] = Form.useForm();
  const [highlightsCount, setHighlightsCount] = useState(1);

  // New state for image handling
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Helper function for image URLs - Process URLs before display
  // Enhanced URL processing function
  // Replace the entire getFullImageUrl function with this clean version:

  // Helper function for image URLs - Process URLs before display
  const getFullImageUrl = (url) => {
    // Check for null, undefined, empty string, or the literal string "undefined"
    if (!url || url === "undefined") {
      console.log("Invalid URL detected:", url);
      return null;
    }

    console.log("Processing URL:", url);

    // If it's already a full URL, return it
    if (url.startsWith("http")) {
      console.log("URL is already absolute:", url);
      return url;
    }

    // If it's a relative URL (starts with slash), prepend API_URL
    if (url.startsWith("/")) {
      const fullUrl = `${API_URL}${url}`;
      console.log("Created full URL from relative path:", fullUrl);
      return fullUrl;
    }

    // If it's a base64 data URL, return as is
    if (url.startsWith("data:")) {
      console.log("URL is a data URL");
      return url;
    }

    // Default case - try to make it a full URL
    const fullUrl = `${API_URL}/${url.replace(/^\//, "")}`;
    console.log("Created full URL (default case):", fullUrl);
    return fullUrl;
  };

  // Fetch programs on mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  // Reset image state when modal changes
  useEffect(() => {
    if (!modalVisible) {
      setImageUrl("");
      setFileList([]);
    } else if (modalType === "edit" && selectedProgram?.image_url) {
      setImageUrl(selectedProgram.image_url);
    }
  }, [modalVisible, modalType, selectedProgram]);

  // Fetch programs from API
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to access this page");
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/v1/auth/training-programs",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        // Process each program to ensure image_urls are properly formatted
        const processedPrograms = (response.data.data || []).map((program) => {
          // Process image URL to ensure it's a full URL
          const fullImageUrl =
            program.image_url && program.image_url !== "undefined"
              ? getFullImageUrl(program.image_url)
              : null;

          console.log(
            `Program ${program.program_id} original image URL: ${program.image_url}`
          );
          console.log(
            `Program ${program.program_id} processed image URL: ${fullImageUrl}`
          );

          return {
            ...program,
            // Store both original and processed URLs
            original_image_url: program.image_url,
            image_url: fullImageUrl,
          };
        });

        setPrograms(processedPrograms);
      } else {
        message.error("Failed to fetch training programs");
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      message.error("Failed to fetch training programs");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to perform this action");
        setLoading(false);
        return;
      }

      // Create FormData object for file upload
      const formData = new FormData();

      // Append all form values to FormData
      Object.keys(values).forEach((key) => {
        // Skip image_url if we have a file
        if (key !== "image_url" || !fileList.length) {
          formData.append(key, values[key]);
        }
      });

      // Add highlights array properly
      if (values.highlights) {
        values.highlights.forEach((highlight, index) => {
          if (highlight && highlight.trim() !== "") {
            formData.append(`highlights[${index}]`, highlight);
          }
        });
      }

      // Handle image - check if we have an actual file to upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const fileObj = fileList[0].originFileObj;
        console.log("Uploading file:", fileObj.name, "Type:", fileObj.type);
        console.log("File object:", fileObj);

        // Handle image - check if we have an actual file to upload
        if (fileList.length > 0 && fileList[0].originFileObj) {
          const fileObj = fileList[0].originFileObj;
          console.log("Uploading file:", fileObj.name, "Type:", fileObj.type);
          console.log("File object:", fileObj); // Add this line to inspect the file object

          try {
            // Append with correct field name expected by backend
            formData.append("image", fileObj); // Use the original file object directly

            console.log("FormData after appending file:");
            for (let [key, value] of formData.entries()) {
              if (value instanceof File) {
                console.log(
                  `${key}: File (${value.name}, ${value.type}, ${value.size} bytes)`
                );
              } else {
                console.log(`${key}: ${value}`);
              }
            }
          } catch (fileError) {
            console.error("Error appending file to FormData:", fileError);
          }
        }

        // Create a new File object to ensure it's properly formatted
        const file = new File([fileObj], fileObj.name, {
          type: fileObj.type,
        });

        // Append with correct field name expected by backend
        formData.append("image", file);

        // Log FormData entries for debugging
        for (let [key, value] of formData.entries()) {
          console.log(
            `${key}: ${value instanceof File ? "File: " + value.name : value}`
          );
        }
      }
      // Only use image_url if no file is selected
      else if (values.image_url) {
        formData.append("image_url", values.image_url);
      }

      console.log("Submitting form data with image");

      console.log("Form data contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File (${value.name}, ${value.type}, ${value.size} bytes)`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      let response;
      if (modalType === "add") {
        response = await axios.post(
          "http://localhost:8000/api/v1/auth/training-programs",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data", // Important for file uploads!
            },
          }
        );

        console.log("Request configuration:", {
          url: response.config.url,
          method: response.config.method,
          headers: response.config.headers,
          data: response.config.data ? "FormData object" : "No data",
        });
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);

        // Debug the server response
        // Add this inside handleSubmit, right after the API response
        if (response.data && response.data.success) {
          console.log("Response from server:", response.data);
          console.log("Image URL in response:", response.data.data?.image_url);

          // Log how getFullImageUrl would process this URL:
          if (response.data.data?.image_url) {
            console.log(
              "Processed image URL:",
              getFullImageUrl(response.data.data.image_url)
            );
          }
        }

        message.success("Training program created successfully");
      } else {
        response = await axios.put(
          `http://localhost:8000/api/v1/auth/training-programs/${selectedProgram.program_id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data", // Important for file uploads!
            },
          }
        );
        console.log("Request configuration:", {
          url: response.config.url,
          method: response.config.method,
          headers: response.config.headers,
          data: response.config.data ? "FormData object" : "No data",
        });
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);

        // Debug the server response
        if (response.data && response.data.success) {
          console.log("Server response:", response.data);
          if (response.data.data && response.data.data.image_url) {
            console.log("Image URL in response:", response.data.data.image_url);
          }
        }

        message.success("Training program updated successfully");
      }

      // Reset and refresh
      setModalVisible(false);
      form.resetFields();
      fetchPrograms();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to save training program");
    } finally {
      setLoading(false);
    }
  };

  // Image upload handlers
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    setFileList([file]);

    // Return false to prevent auto upload
    return false;
  };

  // Replace your handleChange function with this improved version
  const handleChange = (info) => {
    // If file is removed
    if (info.file.status === "removed") {
      setFileList([]);
      setImageUrl("");
      return;
    }

    // Keep only the latest file
    const newFileList = [info.file];
    setFileList(newFileList);

    // Generate preview for the file
    if (info.file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
        setUploadLoading(false);
      };
      setUploadLoading(true);
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // Render image preview
  const renderImagePreview = () => {
    if (!imageUrl) {
      return (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      );
    }

    // Use the enhanced URL processing
    const displayUrl = getFullImageUrl(imageUrl);

    console.log("Preview image URL:", displayUrl);

    return (
      <img
        src={displayUrl}
        alt="Program cover"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  };

  // Handle program deletion
  // Enhanced handleDelete function with better error handling and UI feedback
  const handleDelete = async (programId) => {
    try {
      setDeleteLoading(true);

      // Get auth token with fallback
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to delete a program");
        setDeleteLoading(false);
        return;
      }

      // Make the delete request
      const response = await axios.delete(
        `http://localhost:8000/api/v1/auth/training-programs/${programId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Request configuration:", {
        url: response.config.url,
        method: response.config.method,
        headers: response.config.headers,
        data: response.config.data ? "FormData object" : "No data",
      });
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      // Handle successful deletion
      message.success("Training program deleted successfully");

      // Update local state immediately without waiting for fetchPrograms
      setPrograms((prevPrograms) =>
        prevPrograms.filter((program) => program.program_id !== programId)
      );
    } catch (error) {
      console.error("Error deleting program:", error);

      // Show specific error message based on response
      if (error.response) {
        if (error.response.status === 404) {
          message.error("Program not found. It may have been already deleted.");
        } else if (error.response.status === 403) {
          message.error("You don't have permission to delete this program.");
        } else {
          message.error(
            error.response.data?.message || "Failed to delete program"
          );
        }
      } else {
        message.error(
          "Network error. Please check your connection and try again."
        );
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open modal for editing a program
  const handleEdit = (program) => {
    setModalType("edit");
    setSelectedProgram(program);

    // Set highlights count based on existing program
    const count = program.highlights ? program.highlights.length : 1;
    setHighlightsCount(Math.max(count, 1));

    // Set image URL if exists
    if (program.image_url) {
      setImageUrl(program.image_url);
    }

    // Set form values
    form.setFieldsValue({
      title: program.title,
      description: program.description,
      goal_type: program.goal_type,
      difficulty: program.difficulty,
      duration: program.duration,
      frequency: program.frequency,
      image_url: program.image_url,
      file_url: program.file_url,
      featured: program.featured,
      highlights: program.highlights || [""],
    });

    setModalVisible(true);
  };

  // Open modal for adding a new program
  const handleAdd = () => {
    setModalType("add");
    setSelectedProgram(null);
    setHighlightsCount(1);
    setImageUrl("");
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({
      featured: false,
      highlights: [""],
    });
    setModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    // In your columns definition:
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image_url",
      render: (url, record) => {
        // First check the processed URL from our enhanced processing
        const imageSource = url && url !== "undefined" ? url : null;

        console.log(`Rendering image for program ${record.program_id}:`, {
          processedUrl: url,
          originalUrl: record.original_image_url,
          imageSource: imageSource,
        });

        return imageSource ? (
          <img
            src={imageSource}
            alt="Preview"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: "4px",
            }}
            onError={(e) => {
              console.error("Image failed to load:", imageSource);
              e.target.onerror = null;
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = "Image Error";
            }}
          />
        ) : (
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
      },
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
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: "Are you sure you want to delete this training program?",
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
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4}>Training Programs Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Program
        </Button>
      </div>

      <Table
        loading={loading}
        dataSource={programs}
        columns={columns}
        rowKey="program_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Add/Edit Modal */}
      <Modal
        title={
          modalType === "add" ? "Add Training Program" : "Edit Training Program"
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ featured: false }}
        >
          <Form.Item
            name="title"
            label="Program Title"
            rules={[{ required: true, message: "Please enter program title" }]}
          >
            <Input placeholder="Enter program title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter program description" },
            ]}
          >
            <TextArea rows={4} placeholder="Enter program description" />
          </Form.Item>

          <Form.Item
            name="goal_type"
            label="Goal Type"
            rules={[{ required: true, message: "Please select goal type" }]}
          >
            <Select placeholder="Select goal type">
              <Option value="hypertrophy">Muscle Growth (Hypertrophy)</Option>
              <Option value="strength">Strength</Option>
              <Option value="cardio">Cardiovascular</Option>
              <Option value="endurance">Endurance</Option>
              <Option value="crossfit">CrossFit</Option>
              <Option value="hybrid">Hybrid</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="Difficulty Level"
            rules={[
              { required: true, message: "Please select difficulty level" },
            ]}
          >
            <Select placeholder="Select difficulty level">
              <Option value="beginner">Beginner</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="advanced">Advanced</Option>
              <Option value="expert">Expert</Option>
            </Select>
          </Form.Item>

          <Space size={24} style={{ display: "flex", marginBottom: 24 }}>
            <Form.Item
              name="duration"
              label="Duration"
              rules={[{ required: true, message: "Enter duration" }]}
            >
              <Input placeholder="e.g., 6 weeks" />
            </Form.Item>

            <Form.Item
              name="frequency"
              label="Frequency"
              rules={[{ required: true, message: "Enter frequency" }]}
            >
              <Input placeholder="e.g., 3 days/week" />
            </Form.Item>

            <Form.Item
              name="featured"
              label="Featured Program"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>

          {/* Program Image with updated rendering */}
          <Form.Item label="Program Image">
            <Upload
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              fileList={fileList}
            >
              {renderImagePreview()}
            </Upload>
            {imageUrl && (
              <Button
                type="text"
                danger
                onClick={() => {
                  setImageUrl("");
                  setFileList([]);
                  form.setFieldsValue({ image_url: "" });
                }}
              >
                Remove image
              </Button>
            )}
          </Form.Item>

          <Form.Item
            name="image_url"
            label="Or Enter Image URL"
            rules={[{ type: "url", message: "Please enter a valid URL" }]}
          >
            <Input
              placeholder="Enter image URL directly"
              disabled={fileList.length > 0}
            />
          </Form.Item>

          <Form.Item
            name="file_url"
            label="File URL (Download Link)"
            rules={[
              { required: true, message: "Please enter the file URL" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input placeholder="Enter file download URL" />
          </Form.Item>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">Program Highlights</label>
              <Button
                type="dashed"
                onClick={() => setHighlightsCount((prev) => prev + 1)}
                icon={<PlusOutlined />}
              >
                Add Highlight
              </Button>
            </div>

            {[...Array(highlightsCount)].map((_, index) => (
              <Form.Item
                key={`highlights[${index}]`}
                name={["highlights", index]}
                rules={
                  index === 0
                    ? [
                        {
                          required: true,
                          message: "Please enter at least one highlight",
                        },
                      ]
                    : []
                }
              >
                <Input placeholder={`Program highlight ${index + 1}`} />
              </Form.Item>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {modalType === "add" ? "Create Program" : "Update Program"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TrainingProgramsAdmin;
