import React, { useState, useEffect } from "react";
import { Typography, Table, Button, Space, message, Image } from "antd";
import axios from "axios";

const { Title } = Typography;

const SupplementsAdmin = () => {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplements = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view supplements.");
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/api/v1/auth/supplement", // Adjust the API endpoint if necessary
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

    fetchSupplements();
  }, []);

  const columns = [
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image_url",
      render: (image_url) => (
        <Image
          src={image_url}
          alt="Supplement"
          width={50}
          height={50}
          style={{ objectFit: "cover" }}
          onError={(e) => {
            e.target.onerror = null; // prevents looping
            e.target.src = "url_to_default_image"; // Replace with your default image URL
          }}
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
          <Button type="danger">Delete</Button>
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
      <Title level={4}>Supplements Management</Title>
      <Table dataSource={supplements} columns={columns} rowKey="id" />
    </div>
  );
};

export default SupplementsAdmin;
