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
        // Process each program to ensure image_urls are properly formatted
        const processedPrograms = result.data.map((program) => {
          // For Cloudinary URLs, don't process them further
          if (program.image_url?.includes("cloudinary.com")) {
            return {
              ...program,
              original_image_url: program.image_url,
            };
          }

          // For other URLs, process them
          const fullImageUrl =
            program.image_url && program.image_url !== "undefined"
              ? getFullImageUrl(program.image_url)
              : null;

          return {
            ...program,
            original_image_url: program.image_url,
            image_url: fullImageUrl,
          };
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