import React, { useState, useEffect } from "react";
import { Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getFullImageUrl } from "../../utils/imageHelper";
import { fetchTrainingPrograms } from "../../utils/trainingProgramsService";
import ProgramsTable from "../../components/training-programs/ProgramsTable";
import ProgramFormModal from "../../components/training-programs/ProgramFormModal";

const { Title } = Typography;

const TrainingProgramsAdmin = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Fetch programs on mount
  useEffect(() => {
    fetchProgramsData();
  }, []);

  const fetchProgramsData = async () => {
    setLoading(true);
    try {
      const result = await fetchTrainingPrograms();

      if (result.success) {
        // Replace this entire mapping section
        const processedPrograms = result.data.map((program) => {
          // Check if image_url is valid before processing
          if (
            !program.image_url ||
            program.image_url === "undefined" ||
            program.image_url === "null"
          ) {
            return {
              ...program,
              original_image_url: null,
              image_url: null,
            };
          }

          // For Cloudinary URLs, don't process them further
          if (program.image_url.includes("cloudinary.com")) {
            return {
              ...program,
              original_image_url: program.image_url,
            };
          }

          // For other URLs, process them with additional validation
          try {
            const fullImageUrl = getFullImageUrl(program.image_url);
            // Validate the URL
            new URL(fullImageUrl); // This will throw an error if invalid

            return {
              ...program,
              original_image_url: program.image_url,
              image_url: fullImageUrl,
            };
          } catch (error) {
            console.warn(
              `Invalid image URL for program ${program.program_id}: ${program.image_url}`
            );
            return {
              ...program,
              original_image_url: program.image_url,
              image_url: null, // Use null for invalid URLs
            };
          }
        });

        setPrograms(processedPrograms);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleAdd = () => {
    setModalType("add");
    setSelectedProgram(null);
    setModalVisible(true);
  };

  const handleEdit = (program) => {
    setModalType("edit");
    setSelectedProgram(program);
    setModalVisible(true);
  };

  const handleDelete = (programId) => {
    setPrograms((prev) => prev.filter((p) => p.program_id !== programId));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4}>Training Programs Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Program
        </Button>
      </div>

      <ProgramsTable
        programs={programs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProgramFormModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        modalType={modalType}
        selectedProgram={selectedProgram}
        onSuccess={fetchProgramsData}
      />
    </div>
  );
};

export default TrainingProgramsAdmin;
