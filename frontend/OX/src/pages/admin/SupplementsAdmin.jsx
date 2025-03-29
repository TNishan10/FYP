import React, { useState, useEffect } from "react";
import { Typography, Table, Button, Space, message, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import AddSupplement from "../../components/admin/AddSupplement";

const { Title } = Typography;

// Base64 encoded simple gray placeholder image (1x1 pixel)
const FALLBACK_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAQ0lEQVR42u3PMREAAAgEoLd/wmMM7SEQkBdNTEwxYsSIESNGjBgxYsSIESNGjBgxYsSIESNGjBgxYsSIESNGjJi5MSp6DAFlI2KiAAAAAElFTkSuQmCC";

const SupplementsAdmin = () => {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view supplements.");
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/v1/auth/supplement",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.data) {
        setSupplements(response.data.data);
      } else {
        setError("No supplements found.");
      }
    } catch (err) {
      console.error("Error fetching supplements:", err);
      setError("Failed to load supplements.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = (newSupplement) => {
    // Refresh the list after adding a new supplement
    fetchSupplements();
    message.success("Supplement added successfully!");
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image_url",
      render: (image_url) => (
        <Image
          src={image_url || FALLBACK_IMAGE}
          alt="Supplement"
          width={50}
          height={50}
          style={{ objectFit: "cover" }}
          fallback={FALLBACK_IMAGE}
          preview={false} // Disable preview to prevent errors with fallback
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "supplement_name",
      key: "supplement_name",
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "Energy",
      dataIndex: "energy",
      key: "energy",
    },
    {
      title: "Protein",
      dataIndex: "protein",
      key: "protein",
    },
    {
      title: "Carbs",
      dataIndex: "carbs",
      key: "carbs",
    },
    {
      title: "Fat",
      dataIndex: "fat",
      key: "fat",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary">Edit</Button>
          <Button danger>Delete</Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <div>Loading supplements...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4}>Supplements Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          Add New
        </Button>
      </div>

      <Table
        dataSource={supplements}
        columns={columns}
        rowKey="supplement_id"
      />

      <AddSupplement
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default SupplementsAdmin;
