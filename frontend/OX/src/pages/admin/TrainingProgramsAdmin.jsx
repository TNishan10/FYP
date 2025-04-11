import React, { useState, useEffect } from "react";
import { uploadToCloudinary } from "../../services/cloudinaryService";
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
  // Fix the useEffect that handles modal changes:
  useEffect(() => {
    if (!modalVisible) {
      setImageUrl("");
      setFileList([]);
    } else if (modalType === "edit" && selectedProgram?.image_url) {
      // For edit mode, use the processed URL from the table data
      console.log(
        "Setting image URL for edit mode:",
        selectedProgram.image_url
      );
      setImageUrl(selectedProgram.image_url);

      // If it's a full URL (likely from Cloudinary), add to fileList as a file object
      if (selectedProgram.image_url.startsWith("http")) {
        // Just create an empty fileList without actual file data
        // This prevents the upload field from showing "Upload" when there's already an image
        setFileList([
          {
            uid: "-1",
            name: "existing-image.jpg",
            status: "done",
            url: selectedProgram.image_url,
          },
        ]);
      }
    }
  }, [modalVisible, modalType, selectedProgram]);

  // Fetch programs from API
  // Update your fetchPrograms function to better handle Cloudinary URLs

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
          // For Cloudinary URLs, don't process them further
          if (program.image_url?.includes("cloudinary.com")) {
            console.log(
              `Program ${program.program_id} has Cloudinary URL:`,
              program.image_url
            );
            return {
              ...program,
              original_image_url: program.image_url,
              // No processing needed for Cloudinary URLs
            };
          }

          // For other URLs, process them
          const fullImageUrl =
            program.image_url && program.image_url !== "undefined"
              ? getFullImageUrl(program.image_url)
              : null;

          console.log(`Program ${program.program_id} image URL processing:`, {
            original: program.image_url,
            processed: fullImageUrl,
          });

          return {
            ...program,
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
  // Replace your current handleSubmit function with this improved version

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to perform this action");
        setLoading(false);
        return;
      }

      // Create FormData for backend submission
      const formData = new FormData();

      // Append all form values except image fields
      Object.keys(values).forEach((key) => {
        if (key !== "image_url_input" && key !== "image_upload") {
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

      // Handle image - first try uploaded file, then fall back to direct URL input
      let finalImageUrl = null;

      // Update this section in the handleSubmit function around line 250
      // Handle image - first try uploaded file, then fall back to direct URL input

      // Option 1: New file upload to Cloudinary
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          setUploadLoading(true);
          const fileObj = fileList[0].originFileObj;
          console.log("Uploading new file to Cloudinary:", fileObj.name);

          finalImageUrl = await uploadToCloudinary(fileObj);
          console.log("Successfully uploaded to Cloudinary:", finalImageUrl);
        } catch (cloudinaryError) {
          console.error("Error uploading to Cloudinary:", cloudinaryError);
          message.error("Failed to upload image to cloud storage");
          setLoading(false);
          setUploadLoading(false);
          return;
        } finally {
          setUploadLoading(false);
        }
      }
      // Option 2: Using existing image URL (in edit mode) - FIXED: removed cloudinary restriction
      else if (modalType === "edit" && imageUrl) {
        console.log("Using existing image URL in edit mode:", imageUrl);
        finalImageUrl = imageUrl;
      }
      // Option 3: Direct URL input
      else if (values.image_url_input) {
        console.log(
          "Using manually entered image URL:",
          values.image_url_input
        );
        finalImageUrl = values.image_url_input;
      }
      // Option 4: Handle edit mode with no changes to image (fallback)
      else if (modalType === "edit" && selectedProgram?.image_url) {
        console.log(
          "Using original program image URL:",
          selectedProgram.image_url
        );
        finalImageUrl = selectedProgram.image_url;
      }

      // Add the final image URL to the form data
      if (finalImageUrl) {
        console.log("Final image URL being sent to server:", finalImageUrl);
        formData.append("image_url", finalImageUrl);
      } else {
        console.warn("No image URL found to submit");
        if (modalType === "add") {
          message.error("Please provide an image for the program");
          setLoading(false);
          return;
        }
      }

      // Log all form data being sent
      console.log("Form data being submitted:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Submit to your backend API
      let response;
      if (modalType === "add") {
        response = await axios.post(
          "http://localhost:8000/api/v1/auth/training-programs",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Create response:", response.data);
        message.success("Training program created successfully");
      } else if (modalType === "edit") {
        response = await axios.put(
          `http://localhost:8000/api/v1/auth/training-programs/${selectedProgram.program_id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Update response:", response.data);
        message.success("Training program updated successfully");
      }

      // Reset and refresh
      setModalVisible(false);
      form.resetFields();
      await fetchPrograms(); // Added await here to ensure it completes
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
      image_url_input: program.image_url,
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
  // Replace your existing image column definition with this improved version
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

        console.log(`Rendering image for program ${record.program_id}:`, {
          processedUrl: url,
          originalUrl: record.original_image_url,
          finalImageSource: imageSource,
          isCloudinaryUrl: imageSource?.includes("cloudinary.com"),
        });

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
              e.target.src = "https://via.placeholder.com/50x50?text=Error";
            }}
          />
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
          <Form.Item
            label="Program Image"
            name="image_upload"
            rules={[
              {
                required:
                  modalType === "add" && !form.getFieldValue("image_url_input"),
                message: "Please upload a program image or provide a URL",
              },
            ]}
          >
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={true}
              beforeUpload={(file) => {
                const isJpgOrPng =
                  file.type === "image/jpeg" || file.type === "image/png";
                if (!isJpgOrPng) {
                  message.error("You can only upload JPG/PNG files!");
                  return Upload.LIST_IGNORE;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error("Image must be smaller than 2MB!");
                  return Upload.LIST_IGNORE;
                }

                // Preview the image locally
                const reader = new FileReader();
                reader.onload = (e) => {
                  setImageUrl(e.target.result);
                };
                reader.readAsDataURL(file);

                // Update fileList
                setFileList([file]);

                // Return false to prevent automatic upload
                return false;
              }}
              fileList={fileList}
              onRemove={() => {
                setFileList([]);
                setImageUrl("");
              }}
            >
              {fileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          {imageUrl && (
            <div style={{ marginTop: 8 }}>
              <img
                src={
                  imageUrl.startsWith("data:")
                    ? imageUrl
                    : getFullImageUrl(imageUrl)
                }
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: 200 }}
                onError={(e) => {
                  console.error("Preview image failed to load:", imageUrl);
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/400x200?text=Image+Error";
                }}
              />
            </div>
          )}

          <Form.Item
            name="image_url_input" // Changed from image_url to image_url_input
            label="Or Enter Image URL"
            rules={[
              {
                type: "url",
                message: "Please enter a valid URL",
              },
              {
                required: modalType === "add" && fileList.length === 0,
                message: "Please upload an image or provide a URL",
              },
            ]}
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
