import React, { useState } from "react";
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
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Title } = Typography;

const AddSupplement = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to add a supplement");
        return;
      }

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("company", values.company);
      formData.append("description", values.description);
      formData.append("tips", values.tips || "");
      formData.append("energy", values.energy);
      formData.append("protein", values.protein);
      formData.append("carbs", values.carbs);
      formData.append("fat", values.fat);

      if (fileList.length > 0) {
        formData.append("image", fileList[0].originFileObj);
      } else {
        formData.append("image_url", values.image_url || "");
      }

      console.log("Sending supplement data:", formData);

      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/supplement",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.success) {
        message.success("Supplement added successfully!");
        form.resetFields();
        setImageUrl("");
        setFileList([]);
        if (onSuccess) onSuccess(response.data.data);
        onCancel();
      } else {
        throw new Error(response.data?.message || "Failed to add supplement");
      }
    } catch (error) {
      console.error("Error adding supplement:", error);
      // Detailed error logging
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
          "An error occurred while adding the supplement"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const handleChange = (info) => {
    setFileList(info.fileList);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  return (
    <Modal
      title={<Title level={4}>Add New Supplement</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
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
              Add Supplement
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSupplement;
