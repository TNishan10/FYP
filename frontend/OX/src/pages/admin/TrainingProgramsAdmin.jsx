import React, { useState, useEffect } from "react";
import { Tabs, Button, Typography, Spin, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "../../services/api";
import ProgramsTable from "../../components/training-programs/ProgramsTable";
import ProgramCreationForm from "../../components/training-programs/ProgramCreationForm";
import ProgramPreview from "../../components/training-programs/ProgramPreview";
import PDFPreviewModal from "../../components/common/PDFPreviewModal";

const { Title } = Typography;

const TrainingProgramsAdmin = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Fetch all training programs
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await api.trainingPrograms.getAll();
      setPrograms(response.data.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
      message.error("Failed to load training programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Handle adding a new program
  const handleAddNew = () => {
    setSelectedProgram(null);
    setActiveTab("add");
  };

  // Handle editing an existing program
  const handleEdit = (program) => {
    setSelectedProgram(program);
    setActiveTab("edit");
  };

  // Handle deleting a program
  const handleDelete = async (programId) => {
    try {
      await api.trainingPrograms.delete(programId);
      message.success("Program deleted successfully");
      fetchPrograms();
    } catch (error) {
      console.error("Error deleting program:", error);
      message.error("Failed to delete program");
    }
  };

  // Handle previewing a program
  const handlePreview = (program) => {
    setSelectedProgram(program);
    setActiveTab("preview");
  };

  // Handle form submission (create or update)
  // In TrainingProgramsAdmin.jsx, update the handleSubmit function:
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      console.log("Submitting program data:", formData); // Log the data being sent

      if (selectedProgram?.program_id) {
        // Update existing program
        await api.trainingPrograms.update(selectedProgram.program_id, formData);
        message.success("Program updated successfully");
      } else {
        // Create new program
        const response = await api.trainingPrograms.create(formData);
        console.log("Create program response:", response); // Log the response
        message.success("Program created successfully");
      }

      await fetchPrograms();
      setActiveTab("list");
    } catch (error) {
      console.error("Error submitting program:", error);
      console.error("Error response data:", error.response?.data); // Log the detailed error
      console.error("Error status:", error.response?.status);

      message.error(error.response?.data?.message || "Failed to save program");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate PDF for preview or download
  const handleGeneratePdf = async (program) => {
    try {
      const response = await api.trainingPrograms.generatePdf(
        program.program_id
      );

      if (response.data && response.data.pdf_url) {
        setPdfUrl(response.data.pdf_url);
        setPreviewVisible(true);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to generate PDF");
    }
  };

  // Handle PDF download
  const handleDownload = (url) => {
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = `program-${selectedProgram?.program_id || "new"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="training-programs-admin">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          activeTab === "list" && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNew}
            >
              Add Program
            </Button>
          )
        }
        items={[
          {
            key: "list",
            label: "Programs List",
            children: (
              <div>
                <div className="mb-4">
                  <Title level={4}>Training Programs Management</Title>
                </div>

                <ProgramsTable
                  programs={programs}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                />
              </div>
            ),
          },
          {
            key: "add",
            label: "Create New Program",
            children: (
              <div>
                <div className="mb-4">
                  <Title level={4}>Create New Training Program</Title>
                </div>

                <ProgramCreationForm
                  onSubmit={handleSubmit}
                  loading={submitting}
                />
              </div>
            ),
          },
          {
            key: "edit",
            label: "Edit Program",
            disabled: !selectedProgram,
            children: (
              <div>
                <div className="mb-4">
                  <Title level={4}>Edit Training Program</Title>
                </div>

                {selectedProgram ? (
                  <ProgramCreationForm
                    initialValues={selectedProgram}
                    onSubmit={handleSubmit}
                    loading={submitting}
                  />
                ) : (
                  <Spin size="large" />
                )}
              </div>
            ),
          },
          {
            key: "preview",
            label: "Program Preview",
            disabled: !selectedProgram,
            children: (
              <div>
                <div className="mb-4">
                  <Title level={4}>Program Preview</Title>
                </div>

                {selectedProgram ? (
                  <ProgramPreview
                    program={selectedProgram}
                    onDownload={handleGeneratePdf}
                    onPdfPreview={handleGeneratePdf}
                  />
                ) : (
                  <Spin size="large" />
                )}
              </div>
            ),
          },
        ]}
      />

      <PDFPreviewModal
        visible={previewVisible}
        url={pdfUrl}
        onClose={() => setPreviewVisible(false)}
        onDownload={() => handleDownload(pdfUrl)}
      />
    </div>
  );
};

export default TrainingProgramsAdmin;
