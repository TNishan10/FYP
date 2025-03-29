import React from "react";
import { Button } from "antd";

const AuthRequiredMessage = ({ onLoginClick }) => {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <h2 className="text-2xl mb-4">Authentication Required</h2>
      <p className="mb-6">
        Please log in to access your progress tracking data.
      </p>
      <Button type="primary" size="large" onClick={onLoginClick}>
        Log In
      </Button>
    </div>
  );
};

export default AuthRequiredMessage;
