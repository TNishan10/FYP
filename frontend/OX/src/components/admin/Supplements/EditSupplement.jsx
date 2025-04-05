import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Upload,
  Space,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Title } = Typography;

const EditSupplement = ({ visible, onCancel, onSuccess, supplement }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);

  // Reset form and state when supplement changes or modal opens/closes
  useEffect(() => {
    if (supplement && visible) {
      form.setFieldsValue({
        name: supplement.supplement_name,
        company: supplement.company,
        description: supplement.description,
        tips: supplement.tips,
        energy: supplement.energy,
        protein: supplement.protein,
        carbs: supplement.carbs,
        fat: supplement.fat,
        image_url: supplement.image_url,
      });

      setImageUrl(supplement.image_url || "");
    } else if (!visible) {
      // Reset form when modal closes
      form.resetFields();
      setImageUrl("");
      setFileList([]);
    }
  }, [supplement, visible, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to update a supplement");
        return;
      }

      // Prepare data for API
      const supplementData = {
        supplement_name: values.name,
        company: values.company,
        description: values.description,
        tips: values.tips || "",
        energy: values.energy,
        protein: values.protein,
        carbs: values.carbs,
        fat: values.fat,
        image_url: imageUrl || values.image_url || "",
      };

      console.log("Updating supplement data:", supplementData);

      const response = await axios.put(
        `http://localhost:8000/api/v1/auth/supplement/${supplement.supplement_id}`,
        supplementData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        message.success("Supplement updated successfully!");

        // Don't reset form here - just close modal and notify parent
        if (onSuccess) onSuccess(response.data.data);
        onCancel();
      } else {
        throw new Error(
          response.data?.message || "Failed to update supplement"
        );
      }
    } catch (error) {
      console.error("Error updating supplement:", error);
      if (error.response) {
        console.error("Response error details:", {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        });
      }

      message.error(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while updating the supplement"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (info) => {
    setFileList(info.fileList.slice(-1)); // Only keep the latest file

    if (info.file.status === "uploading") {
      return;
    }

    if (info.file.originFileObj) {
      getBase64(info.file.originFileObj, (url) => {
        setImageUrl(url);
      });
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG files!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
    }
    return false; // Return false to prevent auto upload
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  return (
    <Modal
      title={<Title level={4}>Edit Supplement</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          energy: "0 kcal",
          protein: "0g",
          carbs: "0g",
          fat: "0g",
        }}
      >
        <Form.Item
          name="name"
          label="Supplement Name"
          rules={[{ required: true, message: "Please enter supplement name" }]}
        >
          <Input placeholder="Enter supplement name" />
        </Form.Item>

        <Form.Item
          name="company"
          label="Company"
          rules={[{ required: true, message: "Please enter company name" }]}
        >
          <Input placeholder="Enter company name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <TextArea rows={4} placeholder="Enter supplement description" />
        </Form.Item>

        <Form.Item name="tips" label="Usage Tips">
          <TextArea rows={2} placeholder="Enter usage tips (optional)" />
        </Form.Item>

        <Space size="large" style={{ display: "flex", flexWrap: "wrap" }}>
          <Form.Item name="energy" label="Energy">
            <Input placeholder="e.g., 120 kcal" />
          </Form.Item>

          <Form.Item name="protein" label="Protein">
            <Input placeholder="e.g., 24g" />
          </Form.Item>

          <Form.Item name="carbs" label="Carbohydrates">
            <Input placeholder="e.g., 3g" />
          </Form.Item>

          <Form.Item name="fat" label="Fat">
            <Input placeholder="e.g., 1.5g" />
          </Form.Item>
        </Space>

        <Form.Item
          name="image_url"
          label="Image URL"
          rules={[
            {
              type: "url",
              message: "Please enter a valid URL",
            },
          ]}
        >
          <Input placeholder="Enter image URL" disabled={!!imageUrl} />
        </Form.Item>

        <Form.Item label="Or Upload Image">
          <Upload
            name="image"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            fileList={fileList}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="avatar"
                style={{
                  width: "100%",
                }}
              />
            ) : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item style={{ marginTop: 24, textAlign: "right" }}>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Supplement
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSupplement;
