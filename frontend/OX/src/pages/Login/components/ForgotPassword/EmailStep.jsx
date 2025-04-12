import React from "react";
import { Spin } from "antd";

const EmailStep = ({ email, setEmail, sendingOtp, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="animate-fadeIn">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Reset Password</h3>
      <p className="mb-6 text-gray-600">
        Enter your email to receive a verification code
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="username"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={sendingOtp}
          className={`px-5 py-2 rounded-md text-white transition-all duration-200 ${
            sendingOtp ? "bg-gray-400" : "bg-[#060606] hover:bg-gray-800"
          }`}
        >
          {sendingOtp ? (
            <span className="flex items-center justify-center">
              <Spin size="small" />
              <span className="ml-2">Sending...</span>
            </span>
          ) : (
            "Send Code"
          )}
        </button>
      </div>
    </form>
  );
};

export default EmailStep;
