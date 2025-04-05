import React, { useState, useEffect } from "react";
import { Typography, Table, Button, Space, message, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import AddSupplement from "../../components/admin/Supplements/AddSupplement";
import EditSupplement from "../../components/admin/Supplements/EditSupplement";
import DeleteSupplement from "../../components/admin/Supplements/DeleteSupplement";

const { Title } = Typography;

// Base64 encoded simple gray placeholder image (1x1 pixel)
const FALLBACK_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAQ0lEQVR42u3PMREAAAgEoLd/wmMM7SEQkBdNTEwxYsSIESNGjBgxYsSIESNGjBgxYsSIESNGjBgxYsSIESNGjJi5MSp6DAFlI2KiAAAAAElFTkSuQmCC";

const SupplementsAdmin = () => {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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
        // Sort supplements consistently by ID to maintain order
        const sortedSupplements = [...response.data.data].sort(
          (a, b) => a.supplement_id - b.supplement_id
        );
        setSupplements(sortedSupplements);
        setPagination((prev) => ({
          ...prev,
          total: sortedSupplements.length,
        }));
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

  const handleAddSuccess = () => {
    // Refresh the list after adding a new supplement
    fetchSupplements();
    message.success("Supplement added successfully!");
  };

  const handleEditSuccess = (updatedSupplement) => {
    // Update the specific supplement in the array without changing order
    const updatedSupplements = supplements.map((sup) =>
      sup.supplement_id === updatedSupplement.supplement_id
        ? updatedSupplement
        : sup
    );
    setSupplements(updatedSupplements);
    message.success("Supplement updated successfully!");
  };

  const handleDeleteSuccess = (deletedId) => {
    // Remove the deleted supplement from the array
    const updatedSupplements = supplements.filter(
      (sup) => sup.supplement_id !== deletedId
    );
    setSupplements(updatedSupplements);
    setPagination((prev) => ({
      ...prev,
      total: updatedSupplements.length,
    }));
    message.success("Supplement deleted successfully!");
  };

  const handleEditClick = (record) => {
    setSelectedSupplement(record);
    setIsEditModalVisible(true);
  };

  const handleDeleteClick = (record) => {
    setSelectedSupplement(record);
    setIsDeleteModalVisible(true);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "supplement_id",
      key: "supplement_id",
      sorter: (a, b) => a.supplement_id - b.supplement_id,
    },
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
          preview={false}
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
          <Button type="primary" onClick={() => handleEditClick(record)}>
            Edit
          </Button>
          <Button danger onClick={() => handleDeleteClick(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (loading && supplements.length === 0) {
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
        pagination={pagination}
        onChange={handleTableChange}
        loading={loading}
      />

      <AddSupplement
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <EditSupplement
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        supplement={selectedSupplement}
      />

      <DeleteSupplement
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onSuccess={handleDeleteSuccess}
        supplement={selectedSupplement}
      />
    </div>
  );
};

export default SupplementsAdmin;
