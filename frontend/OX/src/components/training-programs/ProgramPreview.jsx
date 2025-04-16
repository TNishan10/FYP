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
  Collapse,
  Badge,
} from "antd";
import { CloudDownloadOutlined, CalendarOutlined } from "@ant-design/icons";
import axios from "axios";
import { downloadProgramAsPdf } from "./programPdfGenerator.jsx";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const ProgramPreview = ({ program, onDownload, onPdfPreview }) => {
  const [loading, setLoading] = useState(false);
  const [programData, setProgramData] = useState(null);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (program && program.program_id) {
      fetchProgramWithWorkoutDays(program.program_id);
    } else if (program) {
      // If program is passed directly with workout_days
      setProgramData(program);
    }
  }, [program]);

  const fetchProgramWithWorkoutDays = async (programId) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching program with ID: ${programId}`);
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:8000/api/v1/auth/training-programs/${programId}`,
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
        setProgramData(response.data.data);
      } else {
        setError("Failed to load program details");
        message.error("Failed to load program details");
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
      setError("Error loading program");
      message.error("Error loading program details");
    } finally {
      setLoading(false);
    }
  };

  // New function to handle PDF download
  const handlePdfDownload = async () => {
    if (downloadingPdf) return;

    setDownloadingPdf(true);
    message.loading({ content: "Generating PDF...", key: "pdfDownload" });

    // Pass the whole program data with workout days instead of just the exercises
    const success = await downloadProgramAsPdf(
      programData,
      hasWorkoutDays ? [] : programData.exercises, // Only pass exercises if no workout days
      () => {}, // We're using our own state management
      () => {}
    );

    if (success) {
      message.success({
        content: "PDF downloaded successfully!",
        key: "pdfDownload",
      });
    } else {
      message.error({ content: "Failed to generate PDF", key: "pdfDownload" });
    }

    setDownloadingPdf(false);
  };

  if (!programData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "20px" }}>
          <Text type="secondary">Loading program details...</Text>
        </div>
      </div>
    );
  }

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return moment(dateString).format("MMMM D, YYYY");
  };

  const exerciseColumns = [
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

  // Check if program has workout days
  const hasWorkoutDays =
    programData.workout_days && programData.workout_days.length > 0;

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
            {programData.title || "Untitled Program"}
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
                {programData.description || "No description provided."}
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
                        <Text> {formatGoalType(programData.goal_type)}</Text>
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
                            programData.difficulty ||
                              programData.difficulty_level
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
                          {programData.duration_weeks ||
                            programData.duration ||
                            "N/A"}{" "}
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
                        <Text> {programData.frequency || "N/A"}</Text>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col span={8}>
              {programData.image_url || programData.image ? (
                <div style={{ textAlign: "center" }}>
                  <Image
                    src={programData.image_url || programData.image}
                    alt={programData.title}
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
        {programData.highlights && (
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
                  {programData.highlights}
                </Paragraph>
              </Card>
            </div>
            <Divider style={{ margin: "30px 0", borderColor: "#d9d9d9" }} />
          </>
        )}

        {/* Workout Days and Exercises Section */}
        <div className="paper-section">
          <Title level={4} style={{ marginBottom: "16px", color: "#1a1a1a" }}>
            Training Program Schedule
          </Title>

          {loading ? (
            <div style={{ textAlign: "center", padding: "30px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "15px" }}>
                <Text type="secondary">Loading program details...</Text>
              </div>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Text type="danger">{error}</Text>
            </div>
          ) : hasWorkoutDays ? (
            <Collapse
              defaultActiveKey={[programData.workout_days[0]?.workout_day_id]}
            >
              {programData.workout_days.map((day) => (
                <Panel
                  key={day.workout_day_id}
                  header={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      <span style={{ fontWeight: "bold" }}>
                        {day.day_name || "Workout Day"} -{" "}
                        {formatDate(day.workout_date)}
                      </span>
                      <Badge
                        count={day.exercises?.length || 0}
                        style={{
                          backgroundColor: "#1890ff",
                          marginLeft: 10,
                        }}
                      />
                    </div>
                  }
                >
                  {day.notes && (
                    <div
                      style={{
                        marginBottom: 16,
                        padding: 12,
                        backgroundColor: "#fffbe6",
                        borderRadius: 4,
                      }}
                    >
                      <Text type="secondary" style={{ fontStyle: "italic" }}>
                        <strong>Coach's Notes:</strong> {day.notes}
                      </Text>
                    </div>
                  )}

                  {day.exercises && day.exercises.length > 0 ? (
                    <Table
                      columns={exerciseColumns}
                      dataSource={day.exercises.map((ex, idx) => ({
                        ...ex,
                        key: `${day.workout_day_id}-${idx}`,
                      }))}
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
                    <Text type="secondary">No exercises for this day.</Text>
                  )}
                </Panel>
              ))}
            </Collapse>
          ) : programData.exercises && programData.exercises.length > 0 ? (
            // Fallback for programs without workout days structure
            <div>
              <Card
                title="Program Exercises"
                size="small"
                style={{ marginBottom: 20 }}
              >
                <Table
                  columns={exerciseColumns}
                  dataSource={programData.exercises.map((ex, idx) => ({
                    ...ex,
                    key: idx,
                  }))}
                  pagination={false}
                  size="small"
                  bordered
                  style={{
                    fontSize: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                  scroll={{ x: 1000 }}
                />
              </Card>
            </div>
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
              onClick={handlePdfDownload}
              loading={downloadingPdf}
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
