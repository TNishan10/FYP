import React from "react";
import { Card, Typography, Table, Tag, Image, Button, Space } from "antd";
import { CloudDownloadOutlined, FilePdfOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ProgramPreview = ({ program, onDownload, onPdfPreview }) => {
  if (!program) return null;

  // Prepare exercises for the table
  const exercises = program.exercises?.filter(Boolean) || [];

  const columns = [
    {
      title: "Movement",
      dataIndex: "movement",
      key: "movement",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Intensity",
      dataIndex: "intensity",
      key: "intensity",
      width: 100,
    },
    {
      title: "Weight",
      dataIndex: "weight_used",
      key: "weight_used",
      width: 100,
    },
    {
      title: "RPE",
      dataIndex: "actual_rpe",
      key: "actual_rpe",
      width: 80,
    },
    {
      title: "Sets",
      dataIndex: "sets",
      key: "sets",
      width: 80,
    },
    {
      title: "Reps",
      dataIndex: "reps",
      key: "reps",
      width: 80,
    },
    {
      title: "Tempo",
      dataIndex: "tempo",
      key: "tempo",
      width: 100,
    },
    {
      title: "Rest",
      dataIndex: "rest",
      key: "rest",
      width: 100,
    },
    {
      title: "Coach's Notes",
      dataIndex: "coach_notes",
      key: "coach_notes",
    },
  ];

  return (
    <Card className="program-preview">
      <div className="program-header mb-4">
        <div className="flex flex-col md:flex-row">
          {program.image_url && (
            <div className="mb-4 md:mb-0 md:mr-6">
              <Image
                src={program.image_url}
                alt={program.title}
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  objectFit: "cover",
                }}
                fallback="https://via.placeholder.com/200x200?text=No+Image"
              />
            </div>
          )}

          <div className="flex-1">
            <Title level={3}>{program.title}</Title>
            <Text type="secondary">{program.description}</Text>

            <div className="mt-4 flex flex-wrap gap-2">
              <Tag color="blue">{program.goal_type?.replace("_", " ")}</Tag>
              <Tag color="green">Difficulty: {program.difficulty_level}</Tag>
              <Tag color="orange">Duration: {program.duration}</Tag>
              {program.is_featured && <Tag color="gold">Featured</Tag>}
            </div>
          </div>
        </div>
      </div>

      <div className="program-actions mb-4">
        <Space>
          <Button
            type="primary"
            icon={<CloudDownloadOutlined />}
            onClick={() => onDownload && onDownload(program.program_id)}
          >
            Download Program
          </Button>

          <Button
            icon={<FilePdfOutlined />}
            onClick={() => onPdfPreview && onPdfPreview(program.program_id)}
          >
            Preview PDF
          </Button>
        </Space>
      </div>

      <div className="program-exercises">
        <Title level={4}>Exercises</Title>

        {exercises.length > 0 ? (
          <Table
            columns={columns}
            dataSource={exercises.map((ex, idx) => ({ ...ex, key: idx }))}
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
          />
        ) : (
          <Text type="secondary">No exercises found for this program.</Text>
        )}
      </div>
    </Card>
  );
};

export default ProgramPreview;
