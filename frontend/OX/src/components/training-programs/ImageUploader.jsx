import React, { useState } from "react";
import { Upload, message, Button, Spin } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";

// Cloudinary configuration
const CLOUD_NAME = "dywgqhmpo";
const UPLOAD_PRESET = "OX-Fit"; // This should be your unsigned upload preset
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const ImageUploader = ({
  imageUrl,
  setImageUrl,
  fileList,
  setFileList,
  form,
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle direct upload to Cloudinary
  const uploadToCloudinary = async (file) => {
    try {
      setLoading(true);
      setProgress(10);

      // Create the FormData object to send to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "training-programs");

      setProgress(30);
      console.log("Uploading directly to Cloudinary...");

      // Upload directly to Cloudinary API
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.status}`);
      }

      const result = await response.json();
      setProgress(100);

      // Get the secure URL from the response
      const cloudinaryUrl = result.secure_url;
      console.log("Cloudinary upload successful:", cloudinaryUrl);

      // Update the form with the URL
      setImageUrl(cloudinaryUrl);
      form.setFieldsValue({ image: cloudinaryUrl });

      // Update file list for UI display
      setFileList([
        {
          uid: `-${Date.now()}`,
          name: file.name || "image.jpg",
          status: "done",
          url: cloudinaryUrl,
        },
      ]);

      message.success("Image uploaded successfully!");
      return cloudinaryUrl;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      message.error("Failed to upload image: " + error.message);
      return null;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const beforeUpload = (file) => {
    // Validate file type
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG files!");
      return Upload.LIST_IGNORE;
    }

    // Validate file size
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }

    // Upload the file to Cloudinary
    uploadToCloudinary(file);

    // Return false to prevent default upload behavior
    return false;
  };

  const handleChange = ({ fileList: newFileList }) => {
    // Only update file list if not currently uploading
    if (!loading) {
      setFileList(newFileList);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>
        {loading ? `Uploading ${progress}%` : "Upload"}
      </div>
    </div>
  );

  return (
    <>
      <Upload
        name="image"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={!!fileList.length}
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onRemove={() => {
          setFileList([]);
          setImageUrl("");
          form.setFieldsValue({ image: null });
        }}
      >
        {fileList.length >= 1 ? null : uploadButton}
      </Upload>

      {loading && (
        <div style={{ marginTop: 8 }}>
          <Spin size="small" />
          <span style={{ marginLeft: 8 }}>
            Uploading to Cloudinary: {progress}%
          </span>
        </div>
      )}

      {imageUrl && !loading && (
        <div style={{ marginTop: 8 }}>
          <span className="text-xs text-gray-500">Image URL: </span>
          <span className="text-xs text-gray-400 break-all">{imageUrl}</span>
        </div>
      )}
    </>
  );
};

export default ImageUploader;
