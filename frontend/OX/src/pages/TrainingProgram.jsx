import React, { useState, useEffect } from "react";
import { Typography, Spin, Alert, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProgramFilter from "../components/TrainingPrograms/ProgramFilter";
import ProgramGrid from "../components/TrainingPrograms/ProgramGrid";
import FeaturedProgram from "../components/TrainingPrograms/FeaturedProgram";
import { useAuth } from "../contexts/AuthContext";

const { Title, Paragraph } = Typography;

const TrainingProgram = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [featuredProgram, setFeaturedProgram] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch training programs on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all programs
        const programsResponse = await axios.get(
          "http://localhost:8000/api/v1/auth/training-programs"
        );

        if (programsResponse.data.success) {
          setPrograms(programsResponse.data.data);
        }

        // Fetch featured program
        try {
          const featuredResponse = await axios.get(
            "http://localhost:8000/api/v1/auth/training-programs/featured"
          );
          if (featuredResponse.data.success) {
            setFeaturedProgram(featuredResponse.data.data);
          }
        } catch (featuredError) {
          console.log("No featured program available");
          // Not setting an error as this is optional
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        setError("Failed to load training programs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Filter programs based on selected goal
  const filteredPrograms =
    selectedGoal === "all"
      ? programs
      : programs.filter((program) => program.goal_type === selectedGoal);

  // Handle program download
  const handleDownload = async (programId) => {
    if (!isAuthenticated()) {
      message.warning("Please log in to download training programs");
      navigate("/login", { state: { from: "/training-program" } });
      return;
    }

    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8000/api/v1/auth/training-programs/${programId}/download`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Handle the download - either redirect or open in new window
        window.open(response.data.data.file_url, "_blank");
        message.success("Download started successfully!");
      }
    } catch (error) {
      console.error("Download error:", error);
      if (error.response?.status === 401) {
        message.error("Your session has expired. Please log in again.");
        navigate("/login", { state: { from: "/training-program" } });
      } else {
        message.error("Failed to download program. Please try again later.");
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large">
          <div className="content-container" style={{ minHeight: "200px" }}>
            <p>Loading training programs...</p>
          </div>
        </Spin>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Alert
          message="Error Loading Programs"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Title
            level={1}
            className="text-4xl font-extrabold mb-4 text-gray-900"
          >
            Training Programs
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform your fitness journey with our professionally designed
            training programs. Select a goal below to find the perfect program
            for your needs.
          </Paragraph>
        </div>

        {/* Featured Program */}
        {featuredProgram && (
          <div className="mb-16">
            <FeaturedProgram
              program={featuredProgram}
              onDownload={() => handleDownload(featuredProgram.program_id)}
            />
          </div>
        )}

        {/* Goal Type Filter */}
        <div className="mb-12">
          <ProgramFilter
            selectedGoal={selectedGoal}
            onSelectGoal={setSelectedGoal}
          />
        </div>

        {/* Program Grid */}
        <ProgramGrid programs={filteredPrograms} onDownload={handleDownload} />
      </div>
    </div>
  );
};

export default TrainingProgram;
