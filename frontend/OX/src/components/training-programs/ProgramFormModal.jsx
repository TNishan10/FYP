import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Switch, Button, Space } from "antd";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import ImageUploader from "./ImageUploader";
import HighlightsSection from "./HighlightsSection";
import {
  createTrainingProgram,
  updateTrainingProgram,
} from "../../utils/trainingProgramsService";

const { TextArea } = Input;
const { Option } = Select;

const ProgramFormModal = ({
  visible,
  onCancel,
  modalType,
  selectedProgram,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [highlightsCount, setHighlightsCount] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Reset form when modal opens/closes or when selected program changes
  useEffect(() => {
    if (!visible) {
      setImageUrl("");
      setFileList([]);
      form.resetFields();
      return;
    }

    if (modalType === "add") {
      setHighlightsCount(1);
      form.resetFields();
      form.setFieldsValue({
        featured: false,
        highlights: [""],
      });
    } else if (modalType === "edit" && selectedProgram) {
      // Set highlights count
      const count = selectedProgram.highlights
        ? selectedProgram.highlights.length
        : 1;
      setHighlightsCount(Math.max(count, 1));

      // Set image
      if (selectedProgram.image_url) {
        setImageUrl(selectedProgram.image_url);

        if (selectedProgram.image_url.startsWith("http")) {
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

      // Set form values
      form.setFieldsValue({
        title: selectedProgram.title,
        description: selectedProgram.description,
        goal_type: selectedProgram.goal_type,
        difficulty: selectedProgram.difficulty,
        duration: selectedProgram.duration,
        frequency: selectedProgram.frequency,
        image_url_input: selectedProgram.image_url,
        file_url: selectedProgram.file_url,
        featured: selectedProgram.featured,
        highlights: selectedProgram.highlights || [""],
      });
    }
  }, [visible, modalType, selectedProgram, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

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

      // Handle image upload
      let finalImageUrl = null;

      // Option 1: New file upload to Cloudinary
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          setUploadLoading(true);
          const fileObj = fileList[0].originFileObj;
          finalImageUrl = await uploadToCloudinary(fileObj);
        } catch (cloudinaryError) {
          console.error("Error uploading to Cloudinary:", cloudinaryError);
          throw new Error("Failed to upload image to cloud storage");
        } finally {
          setUploadLoading(false);
        }
      }
      // Option 2: Using existing image URL (in edit mode)
      else if (modalType === "edit" && imageUrl) {
        finalImageUrl = imageUrl;
      }
      // Option 3: Direct URL input
      else if (values.image_url_input) {
        finalImageUrl = values.image_url_input;
      }

      // Add the final image URL to the form data
      if (finalImageUrl) {
        formData.append("image_url", finalImageUrl);
      }

      // Submit to API
      let result;
      if (modalType === "add") {
        result = await createTrainingProgram(formData);
      } else {
        result = await updateTrainingProgram(
          selectedProgram.program_id,
          formData
        );
      }

      if (result.success) {
        onCancel(); // Close modal
        onSuccess(); // Refresh data
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        modalType === "add" ? "Add Training Program" : "Edit Training Program"
      }
      open={visible}
      onCancel={onCancel}
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

        <ImageUploader
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          fileList={fileList}
          setFileList={setFileList}
          form={form}
        />

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

        <HighlightsSection
          highlightsCount={highlightsCount}
          setHighlightsCount={setHighlightsCount}
        />

        <div className="flex justify-end mt-4">
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {modalType === "add" ? "Create Program" : "Update Program"}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default ProgramFormModal;
