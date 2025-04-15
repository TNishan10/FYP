import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import { uploadImage } from "../../services/cloudinaryService";

const ImageUploader = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value);

  const handleUpload = async (file) => {
    setLoading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      onChange(url);
      message.success("Image uploaded successfully");
    } catch (error) {
      console.error("Failed to upload image:", error);
      message.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
    return false; // Prevent default upload behavior
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }

    const isLessThan2MB = file.size / 1024 / 1024 < 2;
    if (!isLessThan2MB) {
      message.error("Image must be smaller than 2MB!");
      return false;
    }

    handleUpload(file);
    return false; // Prevent default upload behavior
  };

  const uploadButton = (
    <Button icon={loading ? <LoadingOutlined /> : <UploadOutlined />}>
      {loading ? "Uploading..." : "Upload Image"}
    </Button>
  );

  return (
    <div className="image-uploader">
      <Upload
        name="image"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        disabled={loading}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Program Cover"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          uploadButton
        )}
      </Upload>
      {imageUrl && (
        <Button
          onClick={() => {
            setImageUrl(null);
            onChange(null);
          }}
          danger
          size="small"
          className="mt-2"
        >
          Remove Image
        </Button>
      )}
    </div>
  );
};

export default ImageUploader;
