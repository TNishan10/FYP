import React from "react";
import { Empty } from "antd";
import ProgramCard from "./ProgramCard";

const ProgramGrid = ({ programs, onDownload }) => {
  if (!programs || programs.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No programs found matching your filter"
        className="py-12"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {programs.map((program) => (
        <ProgramCard
          key={program.program_id}
          program={program}
          onDownload={() => onDownload(program.program_id)}
        />
      ))}
    </div>
  );
};

export default ProgramGrid;
