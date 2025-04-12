import React, { useEffect, useState } from "react";
import { Layout, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const { Content } = Layout;

const AdminLayout = ({ children, selectedKey }) => {
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        if (!userId || !token) {
          message.error("Authentication required");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:8000/api/v1/auth/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          const user = response.data.data;

          if (user.role !== "admin") {
            message.error("You don't have admin privileges");
            navigate("/");
            return;
          }

          setAdminInfo(user);
        } else {
          message.error("Failed to verify admin status");
          navigate("/");
        }
      } catch (error) {
        console.error("Admin verification error:", error);
        message.error("Error verifying admin status");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Verifying admin privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar selectedKey={selectedKey} />
      <Layout>
        <AdminHeader adminInfo={adminInfo} />
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            borderRadius: "8px",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
