import React from "react";
import { Card, Button, Row, Col, Tag, Typography } from "antd";
import { DownloadOutlined, StarFilled } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

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

const FeaturedProgram = ({ program, onDownload }) => {
  // Default image if none provided
  const defaultImage =
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Zml0bmVzc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60";

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <Tag icon={<StarFilled />} color="gold" className="px-3 py-1 text-base">
          Featured Program
        </Tag>
      </div>

      <Card className="overflow-hidden shadow-lg">
        <Row gutter={24}>
          <Col xs={24} md={10}>
            <div className="h-64 md:h-full overflow-hidden rounded-lg">
              <img
                src={program.image_url || defaultImage}
                alt={program.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </Col>

          <Col xs={24} md={14}>
            <div className="flex flex-col h-full">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Tag color={goalTypeColors[program.goal_type] || "#108ee9"}>
                    {program.goal_type}
                  </Tag>
                  <Tag
                    color={
                      difficultyColors[program.difficulty.toLowerCase()] ||
                      "blue"
                    }
                  >
                    {program.difficulty}
                  </Tag>
                  <Tag>{program.duration}</Tag>
                </div>

                <Title level={3} className="mb-2">
                  {program.title}
                </Title>
                <Paragraph className="text-gray-600 mb-4">
                  {program.description}
                </Paragraph>
              </div>

              {program.highlights && program.highlights.length > 0 && (
                <div className="mb-4">
                  <Title level={5}>Program Highlights:</Title>
                  <ul className="list-disc pl-5">
                    {program.highlights.slice(0, 3).map((highlight, index) => (
                      <li key={index} className="text-gray-600">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto">
                <Button
                  type="primary"
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={onDownload}
                  className="bg-gradient-to-r from-blue-500 to-blue-700"
                >
                  Download Featured Program
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default FeaturedProgram;
