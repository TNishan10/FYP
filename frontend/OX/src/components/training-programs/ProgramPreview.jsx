import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  Image,
  Button,
  Space,
  message,
  Divider,
  Row,
  Col,
  Card,
  Spin,
} from "antd";
import {
  CloudDownloadOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

const ProgramPreview = ({ program, onDownload, onPdfPreview }) => {
  const [loading, setLoading] = useState(false);
  const [programExercises, setProgramExercises] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Program data received:", program);

    // If program has exercises, use them
    if (program && program.exercises && program.exercises.length > 0) {
      console.log("Using provided exercises:", program.exercises);
      setProgramExercises(program.exercises);
    }
    // Otherwise fetch exercises for this program
    else if (program && program.program_id) {
      fetchProgramExercises(program.program_id);
    }
  }, [program]);

  const fetchProgramExercises = async (programId) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching exercises for program ID: ${programId}`);
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:8000/api/v1/auth/training-programs/${programId}/exercises`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      console.log("API response:", response.data);

      if (response.data.success) {
        setProgramExercises(response.data.data.exercises || []);
      } else {
        setError("Failed to load exercises for this program");
        message.error("Failed to load exercises for this program");
      }
    } catch (error) {
      console.error("Error fetching program exercises:", error);
      setError("Error loading program exercises");
      message.error("Error loading program exercises");
    } finally {
      setLoading(false);
    }
  };

  if (!program) return null;

  // Use either fetched exercises or program.exercises
  const exercises =
    programExercises.length > 0
      ? programExercises
      : program.exercises?.filter(Boolean) || [];

  // Format difficulty to be title case
  const formatDifficulty = (difficulty) => {
    if (!difficulty) return "N/A";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  // Format goal type with spaces and title case
  const formatGoalType = (goalType) => {
    if (!goalType) return "N/A";
    return goalType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const columns = [
    {
      title: "Movement",
      dataIndex: "movement",
      key: "movement",
      width: 150,
      render: (text) => <strong>{text || "N/A"}</strong>,
    },
    {
      title: "Sets",
      dataIndex: "sets",
      key: "sets",
      width: 80,
      align: "center",
    },
    {
      title: "Reps",
      dataIndex: "reps",
      key: "reps",
      width: 80,
      align: "center",
    },
    {
      title: "Intensity",
      dataIndex: "intensity_kg",
      key: "intensity",
      width: 100,
      align: "center",
      render: (text, record) => record.intensity_kg || record.intensity || "-",
    },
    {
      title: "Weight",
      dataIndex: "weight_used",
      key: "weight_used",
      width: 100,
      align: "center",
      render: (text) => text || "-",
    },
    {
      title: "RPE",
      dataIndex: "actual_rpe",
      key: "actual_rpe",
      width: 80,
      align: "center",
      render: (text) => text || "-",
    },
    {
      title: "Tempo",
      dataIndex: "tempo",
      key: "tempo",
      width: 100,
      align: "center",
      render: (text) => text || "-",
    },
    {
      title: "Rest",
      dataIndex: "rest",
      key: "rest",
      width: 100,
      align: "center",
      render: (text) => text || "-",
    },
    {
      title: "Notes",
      dataIndex: "coaches_notes",
      key: "notes",
      ellipsis: true,
      render: (text, record) => record.coaches_notes || record.notes || "-",
    },
  ];

  return (
    <div
      className="program-preview-paper"
      style={{
        background: "#fff",
        padding: "40px",
        maxWidth: "900px",
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "4px",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        position: "relative",
      }}
    >
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          fontSize: "100px",
          color: "rgba(0,0,0,0.03)",
          fontWeight: "bold",
          textTransform: "uppercase",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 0,
        }}
      >
        OX-FIT
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Document Header */}
        <div
          className="paper-header"
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          <Title
            level={2}
            style={{ margin: 0, fontWeight: "bold", color: "#1a1a1a" }}
          >
            {program.title || "Untitled Program"}
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Training Program
          </Text>
        </div>

        <Divider style={{ margin: "20px 0", borderColor: "#d9d9d9" }} />

        {/* Program Details Section */}
        <div className="paper-section">
          <Row gutter={24}>
            <Col span={16}>
              <Title
                level={4}
                style={{ marginBottom: "16px", color: "#1a1a1a" }}
              >
                Program Overview
              </Title>
              <Paragraph
                style={{ fontSize: "14px", lineHeight: "1.8", color: "#333" }}
              >
                {program.description || "No description provided."}
              </Paragraph>

              <div style={{ marginTop: "20px" }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ background: "#f5f5f5" }}
                    >
                      <div className="detail-item">
                        <Text strong>Goal Type:</Text>
                        <Text> {formatGoalType(program.goal_type)}</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ background: "#f5f5f5" }}
                    >
                      <div className="detail-item">
                        <Text strong>Difficulty Level:</Text>
                        <Text>
                          {formatDifficulty(
                            program.difficulty || program.difficulty_level
                          )}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ background: "#f5f5f5" }}
                    >
                      <div className="detail-item">
                        <Text strong>Duration:</Text>
                        <Text>
                          {program.duration_weeks || program.duration || "N/A"}{" "}
                          weeks
                        </Text>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ background: "#f5f5f5" }}
                    >
                      <div className="detail-item">
                        <Text strong>Frequency:</Text>
                        <Text> {program.frequency || "N/A"}</Text>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col span={8}>
              {program.image_url || program.image ? (
                <div style={{ textAlign: "center" }}>
                  <Image
                    src={program.image_url || program.image}
                    alt={program.title}
                    style={{
                      maxWidth: "100%",
                      borderRadius: "4px",
                      border: "1px solid #f0f0f0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    fallback="data:image/png;base64,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"
                    preview={{
                      mask: (
                        <div style={{ color: "white" }}>View full image</div>
                      ),
                    }}
                  />
                  <Text
                    type="secondary"
                    style={{ display: "block", marginTop: "8px" }}
                  >
                    Program Image
                  </Text>
                </div>
              ) : (
                <div
                  style={{
                    height: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f9f9f9",
                    border: "1px dashed #d9d9d9",
                    borderRadius: "4px",
                  }}
                >
                  <Text type="secondary">No Image Available</Text>
                </div>
              )}
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: "30px 0", borderColor: "#d9d9d9" }} />

        {/* Program Highlights Section */}
        {program.highlights && (
          <>
            <div className="paper-section">
              <Title
                level={4}
                style={{ marginBottom: "16px", color: "#1a1a1a" }}
              >
                Program Highlights
              </Title>
              <Card
                style={{
                  background: "#f9f9f9",
                  borderRadius: "4px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <Paragraph style={{ whiteSpace: "pre-line", color: "#333" }}>
                  {program.highlights}
                </Paragraph>
              </Card>
            </div>
            <Divider style={{ margin: "30px 0", borderColor: "#d9d9d9" }} />
          </>
        )}

        {/* Exercises Section */}
        <div className="paper-section">
          <Title level={4} style={{ marginBottom: "16px", color: "#1a1a1a" }}>
            Training Program Exercises
          </Title>

          {loading ? (
            <div style={{ textAlign: "center", padding: "30px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "15px" }}>
                <Text type="secondary">Loading exercises...</Text>
              </div>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Text type="danger">{error}</Text>
            </div>
          ) : exercises.length > 0 ? (
            <Table
              columns={columns}
              dataSource={exercises.map((ex, idx) => ({ ...ex, key: idx }))}
              pagination={false}
              size="small"
              bordered
              style={{
                fontSize: "12px",
                marginBottom: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
              scroll={{ x: 1000 }}
            />
          ) : (
            <Text type="secondary">No exercises found for this program.</Text>
          )}
        </div>

        {/* Footer */}
        <Divider style={{ margin: "30px 0 20px", borderColor: "#d9d9d9" }} />
        <div className="paper-footer" style={{ textAlign: "center" }}>
          <Space>
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={() => onDownload && onDownload(program.program_id)}
            >
              Download Program
            </Button>
          </Space>
          <div style={{ marginTop: "20px" }}>
            <Text type="secondary">
              © {new Date().getFullYear()} OX-Fit - All Rights Reserved
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramPreview;
