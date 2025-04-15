import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../../config";

const ImageUploader = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value);

  // Helper function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImage = async (file) => {
    try {
      setLoading(true);

      // Convert file to base64
      const base64 = await convertToBase64(file);

      // Send directly to backend instead of Cloudinary
      const response = await axios.post(
        `${API_URL}/api/v1/auth/upload-image`,
        { image: base64 },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              sessionStorage.getItem("token") || localStorage.getItem("token")
            }`,
          },
        }
      );

      if (response.data.success) {
        const url = response.data.imageUrl;
        setImageUrl(url);
        onChange(url);
        message.success("Image uploaded successfully");
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      message.error(
        "Failed to upload image: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG files!");
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }

    uploadImage(file);
    return false; // Prevent auto upload
  };

  return (
    <div>
      {imageUrl && (
        <div className="mb-4">
          <img
            src={imageUrl}
            alt="Program cover"
            style={{ maxWidth: "100%", maxHeight: "200px" }}
          />
        </div>
      )}

      <Upload
        name="programImage"
        listType="picture"
        showUploadList={false}
        beforeUpload={beforeUpload}
      >
        <Button icon={loading ? <LoadingOutlined /> : <UploadOutlined />}>
          {imageUrl ? "Change Image" : "Upload Image"}
        </Button>
      </Upload>
    </div>
  );
};

export default ImageUploader;
