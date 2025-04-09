import React, { useState } from "react";
import { Card, Button, Badge, Modal, Divider, Tag, List } from "antd";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";

// Goal type colors for visual differentiation
const goalTypeColors = {
  hypertrophy: "#f50",
  strength: "#722ed1",
  cardio: "#1890ff",
  endurance: "#52c41a",
  crossfit: "#faad14",
  hybrid: "#13c2c2",
};

// Difficulty level colors
const difficultyColors = {
  beginner: "green",
  intermediate: "blue",
  advanced: "purple",
  expert: "red",
};

const ProgramCard = ({ program, onDownload }) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  // Default image if none provided
  const defaultImage =
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zml0bmVzc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60";

  return (
    <>
      <Badge.Ribbon
        text={program.difficulty}
        color={difficultyColors[program.difficulty.toLowerCase()] || "blue"}
      >
        <Card
          hoverable
          cover={
            <div className="h-48 overflow-hidden">
              <img
                alt={program.title}
                src={program.image_url || defaultImage}
                className="w-full h-full object-cover object-center"
              />
            </div>
          }
          className="h-full flex flex-col"
          actions={[
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setPreviewVisible(true)}
            >
              Preview
            </Button>,
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={onDownload}
            >
              Download
            </Button>,
          ]}
        >
          <div className="flex-1">
            <div className="mb-2">
              <Tag color={goalTypeColors[program.goal_type] || "#108ee9"}>
                {program.goal_type}
              </Tag>
              <Tag>{program.duration}</Tag>
            </div>
            <Card.Meta
              title={program.title}
              description={
                <div className="line-clamp-2 text-gray-500">
                  {program.description.substring(0, 100)}
                  {program.description.length > 100 ? "..." : ""}
                </div>
              }
            />
          </div>
        </Card>
      </Badge.Ribbon>

      {/* Program Preview Modal */}
      <Modal
        title={program.title}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              setPreviewVisible(false);
              onDownload();
            }}
          >
            Download Program
          </Button>,
        ]}
        width={800}
      >
        <img
          src={program.image_url || defaultImage}
          alt={program.title}
          className="w-full h-64 object-cover object-center rounded-lg mb-4"
        />

        <div className="flex flex-wrap gap-2 mb-4">
          <Tag color={goalTypeColors[program.goal_type] || "#108ee9"}>
            {program.goal_type}
          </Tag>
          <Tag
            color={difficultyColors[program.difficulty.toLowerCase()] || "blue"}
          >
            {program.difficulty}
          </Tag>
          <Tag>{program.duration}</Tag>
          <Tag>{program.frequency}</Tag>
        </div>

        <p className="text-base mb-4">{program.description}</p>

        {program.highlights && program.highlights.length > 0 && (
          <>
            <Divider orientation="left">Program Highlights</Divider>
            <List
              size="small"
              bordered
              dataSource={program.highlights}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default ProgramCard;
