import React from "react";
import { Row, Col, Card, Button, Empty } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import LoadingSpinner from "../common/LoadingSpinner";

/**
 * Grid component to display training programs
 * @param {Object} props - Component props
 * @param {Array} props.programs - Array of program objects to display
 * @param {Function} props.onProgramClick - Handler when a program is clicked
 * @param {boolean} [props.loading=false] - Whether the programs are loading
 */
const ProgramGrid = ({ programs, onProgramClick, loading = false }) => {
  if (loading) {
    return <LoadingSpinner message="Loading programs..." />;
  }

  if (!programs || programs.length === 0) {
    return (
      <Empty description="No training programs found" className="my-8 py-16" />
    );
  }

  return (
    <Row gutter={[24, 24]} className="program-grid">
      {programs.map((program) => (
        <Col
          xs={24}
          sm={12}
          md={8}
          lg={8}
          xl={6}
          key={program.program_id}
          className="program-col"
        >
          <Card
            hoverable
            className="h-full flex flex-col program-card"
            cover={
              program.image_url ? (
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${program.image_url})` }}
                />
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )
            }
          >
            <div className="flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">
                  {program.title}
                </h3>

                <div className="mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                    {program.goal_type || "General Fitness"}
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {program.difficulty || "All Levels"}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {program.description || "No description available."}
                </p>
              </div>

              <Button
                type="primary"
                block
                icon={<EyeOutlined />}
                onClick={() => onProgramClick(program)}
              >
                View Details
              </Button>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProgramGrid;
