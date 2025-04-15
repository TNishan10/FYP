import React, { useState } from "react";
import { Button, Tooltip, message } from "antd";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

/**
 * Button component for downloading training programs with authentication check
 * @param {Object} props - Component props
 * @param {number|string} props.programId - ID of the program to download
 * @param {string} [props.size='middle'] - Button size
 * @param {string} [props.text='Download PDF'] - Button text
 * @param {Function} [props.onSuccess] - Callback function after successful download
 * @param {boolean} [props.showIcon=true] - Whether to show the download icon
 */
const ProgramDownloadButton = ({
  programId,
  size = "middle",
  text = "Download PDF",
  onSuccess,
  showIcon = true,
}) => {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDownload = async () => {
    if (!isAuthenticated()) {
      message.warning("Please log in to download training programs");
      navigate("/login", { state: { from: "/training-program" } });
      return;
    }

    setLoading(true);
    try {
      const response = await api.trainingPrograms.download(programId);

      if (response.data.success) {
        // Create an anchor element and trigger the download
        const downloadUrl = response.data.file_url;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `training-program-${programId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        message.success("Program downloaded successfully");
        if (onSuccess) onSuccess(downloadUrl);
      }
    } catch (error) {
      console.error("Download error:", error);
      if (error.response?.status === 401) {
        message.error("Your session has expired. Please log in again.");
        navigate("/login");
      } else {
        message.error("Failed to download program. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={isAuthenticated() ? "" : "Login required to download"}>
      <Button
        type="primary"
        size={size}
        onClick={handleDownload}
        loading={loading}
        icon={
          showIcon && (loading ? <LoadingOutlined /> : <DownloadOutlined />)
        }
        className="download-button"
      >
        {text}
      </Button>
    </Tooltip>
  );
};

export default ProgramDownloadButton;
