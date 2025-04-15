import React, { useState } from "react";
import { Form, Upload, message, Input } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { getFullImageUrl } from "../../utils/imageHelper";

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

    setLoading(true);

    // Convert to base64 for preview and submission
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result;
      setImageUrl(base64);
      form.setFieldsValue({ image: base64 });
      setLoading(false);

      setFileList([
        {
          uid: `-${Date.now()}`,
          name: file.name,
          status: "done",
          originFileObj: file,
        },
      ]);
    };

    return false; // prevent auto upload
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
      <Form.Item
        label="Program Image"
        name="image_upload"
        rules={[
          {
            required: !form.getFieldValue("image_url_input"),
            message: "Please upload a program image or provide a URL",
          },
        ]}
      >
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
          {fileList.length === 0 && uploadButton}
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
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%23999'%3EImage Not Found%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
      )}

      <Form.Item
        name="image_url_input"
        label="Or Enter Image URL"
        rules={[
          {
            type: "url",
            message: "Please enter a valid URL",
          },
          {
            required: fileList.length === 0,
            message: "Please upload an image or provide a URL",
          },
        ]}
      >
        <Input
          placeholder="Enter image URL directly"
          disabled={fileList.length > 0}
        />
      </Form.Item>
    </>
  );
};

export default ImageUploader;
