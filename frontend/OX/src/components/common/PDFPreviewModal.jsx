import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";

const ImageUploader = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value);

  const uploadImage = async (file) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ox_fit_uploads"); // Your Cloudinary upload preset

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/your-cloud-name/image/upload", // Replace with your cloud name
        formData
      );

      const url = response.data.secure_url;
      setImageUrl(url);
      onChange(url);
      message.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return false;
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
