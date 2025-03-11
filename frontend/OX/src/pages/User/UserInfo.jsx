import { Select } from "antd";
import React, { useEffect, useState } from "react";

const UserInfo = () => {
  const [healthCondition, setHealthCondition] = useState([]);
  const getHealthConditions = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/getHealthConditions"
      );
      const data = await response.json();
      console.log("Health Conditions Data:", data?.data);
      setHealthCondition(data?.data);
    } catch (error) {
      console.error("Backend Error:", error);
    }
  };

  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  useEffect(() => {
    getHealthConditions();
  }, []);
  return (
    <div>
      User Info
      <Select
        mode="multiple"
        allowClear
        style={{
          width: "100%",
        }}
        placeholder="Please select health conditions"
        // defaultValue={["a10", "c12"]}
        onChange={handleChange}
        options={healthCondition?.map((item) => ({
          label: item.ConditionName,
          value: item.id,
        }))}
      />
    </div>
  );
};

export default UserInfo;
