import React, { useState } from "react";
import { Form, Upload, message, Input, Button } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { getFullImageUrl } from "../../utils/imageHelper";
import axios from "axios";
import { API_URL } from "../../config";

const ImageUploader = ({
  imageUrl,
  setImageUrl,
  fileList,
  setFileList,
  form,
}) => {
  const [loading, setLoading] = useState(false);

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

    // Handle file upload
    handleUpload(file);
    return false; // Prevent default upload behavior
  };

  const handleUpload = (file) => {
    setLoading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result;

      try {
        // Direct upload to backend
        console.log("Uploading image to backend...");
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");

        const response = await axios.post(
          `${API_URL}/api/v1/auth/upload-image`,
          { image: base64 },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Get the Cloudinary URL
          const cloudinaryUrl = response.data.imageUrl;
          console.log("Image uploaded successfully:", cloudinaryUrl);

          // Update state and form
          setImageUrl(cloudinaryUrl);
          form.setFieldsValue({ image: cloudinaryUrl });

          setFileList([
            {
              uid: `-${Date.now()}`,
              name: file.name,
              status: "done",
              url: cloudinaryUrl,
            },
          ]);

          message.success("Image uploaded successfully");
        } else {
          throw new Error(response.data.message || "Upload failed");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error(
          "Failed to upload image: " +
            (error.response?.data?.message || error.message)
        );
        setFileList([]);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      message.error("Failed to read file");
      setLoading(false);
    };
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      <Form.Item label="Program Image" name="image_upload">
        <Upload
          name="image"
          listType="picture-card"
          showUploadList={true}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          fileList={fileList}
          customRequest={({ onSuccess }) => {
            // Mock the upload success since we handle manually
            setTimeout(() => onSuccess("ok"), 0);
          }}
          onRemove={() => {
            setFileList([]);
            setImageUrl("");
            form.setFieldsValue({ image: null });
          }}
        >
          {fileList.length === 0 && !loading && uploadButton}
          {loading && (
            <div>
              <LoadingOutlined /> Uploading...
            </div>
          )}
        </Upload>
      </Form.Item>

      {imageUrl && (
        <div style={{ marginTop: 8 }}>
          <img
            src={imageUrl}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: 200 }}
            onError={(e) => {
              console.error("Preview image failed to load:", imageUrl);
              e.target.onerror = null;
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%23999'%3EImage Not Found%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
      )}

      <Form.Item name="image" hidden>
        <Input type="hidden" />
      </Form.Item>
    </>
  );
};

export default ImageUploader;
