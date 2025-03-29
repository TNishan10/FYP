import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Form,
  Select,
  Modal,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Radio,
  Card,
  Spin,
  Divider,
} from "antd";

const UserInfo = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noConditionsSelected, setNoConditionsSelected] = useState(false);
  const [selectedGender, setSelectedGender] = useState("Male");
  const [selectedGoal, setSelectedGoal] = useState("Get Fit");
  const { Option } = Select;
  const dateFormat = "YYYY-MM-DD";

  useEffect(() => {
    setSelectedGender(form.getFieldValue("gender"));
    setSelectedGoal(form.getFieldValue("goal"));

    // Listen for form field changes
    const unsubscribe = form.getFieldsValue(["gender", "goal"]);
    return () => unsubscribe;
  }, [form]);

  // Fetch health conditions from API
  useEffect(() => {
    const fetchHealthConditions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/api/v1/auth/health-conditions"
        );

        if (response.data.success) {
          setHealthConditions(response.data.data);
        } else {
          toast.error("Failed to fetch health conditions");
        }
      } catch (error) {
        console.error("Error fetching health conditions:", error);
        toast.error("Failed to load health conditions");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthConditions();
  }, []);

  const handleFormChange = (changedValues) => {
    if (changedValues.gender) {
      setSelectedGender(changedValues.gender);
    }
    if (changedValues.goal) {
      setSelectedGoal(changedValues.goal);
    }
  };
  // Modal control functions
  const showModal = () => {
    setIsModalVisible(true);
    setNoConditionsSelected(false);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    toast.success(`Selected ${selectedConditions.length} health conditions`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle health condition selection - just update local state, no API call
  const handleHealthConditionChange = (values) => {
    setSelectedConditions(values);
  };
  const handleNoConditions = () => {
    setSelectedConditions([]);
    setNoConditionsSelected(true);
    toast.success("No health conditions selected", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Submit user information and health conditions
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      console.log("Submitting form with user ID:", userId);
      console.log("Selected health conditions:", selectedConditions);

      // First, create user info
      const userInfoData = {
        user_id: userId,
        gender: values.gender,
        DOB: values.dob.format("YYYY-MM-DD"),
        weight: values.weight,
        height: values.height,
        goal: values.goal,
        neck_size: values.neck_size || null,
        shoulder_size: values.shoulder_size || null,
        forearm_size: values.forearm_size || null,
        biceps_size: values.biceps_size || null,
        hip_size: values.hip_size || null,
        thigh_size: values.thigh_size || null,
        claves_size: values.claves_size || null,
      };

      console.log("Submitting user info:", userInfoData);

      try {
        // Create user info
        const userInfoResponse = await axios.post(
          "http://localhost:8000/api/v1/auth/user-info",
          userInfoData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        console.log("User info response:", userInfoResponse.data);

        if (userInfoResponse.data.success) {
          // If health conditions were selected, associate them with the user
          if (selectedConditions.length > 0) {
            try {
              // For each selected condition, create a user-health association
              for (const conditionId of selectedConditions) {
                await axios.post(
                  "http://localhost:8000/api/v1/auth/user-health",
                  {
                    user_id: userId,
                    condition_id: conditionId,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${sessionStorage.getItem(
                        "token"
                      )}`,
                    },
                  }
                );
              }

              console.log("Health conditions saved successfully");
            } catch (healthError) {
              console.error("Error saving health conditions:", healthError);

              // Log more details about the error
              if (healthError.response) {
                console.error(
                  "Error response data:",
                  healthError.response.data
                );
                console.error(
                  "Error response status:",
                  healthError.response.status
                );
              }

              toast.warning(
                "User info saved, but there was an error saving health conditions"
              );
            }
          }

          toast.success("User Information Collected!", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
          });

          // Navigate to the home page or dashboard
          navigate("/");
        } else {
          toast.error("Failed to save user information");
        }
      } catch (apiError) {
        console.error("API Error:", apiError);

        // Log more details about the error
        if (apiError.response) {
          console.error("Error response data:", apiError.response.data);
          console.error("Error response status:", apiError.response.status);
        }

        toast.error(
          apiError.response?.data?.message || "Failed to save user information"
        );
      }
    } catch (error) {
      console.error("Error saving user information:", error);
      toast.error("An error occurred while saving your information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="py-12 px-4 md:px-0">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to OX-Fit
            </h1>
            <p className="text-gray-600">
              Tell us about yourself so we can customize your fitness journey
            </p>
          </div>

          <Card
            className="shadow-2xl rounded-2xl border-0 overflow-hidden bg-white"
            bodyStyle={{ padding: "2rem" }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Tell us about yourself
            </h2>

            <Spin spinning={loading}>
              <Form
                form={form}
                name="userInfoForm"
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  gender: "Male",
                  goal: "Get Fit",
                }}
                onValuesChange={handleFormChange}
                className="user-info-form"
              >
                {/* Section: Health */}
                <div className="mb-8 pb-2">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Health Profile
                    </h3>
                  </div>

                  <Form.Item
                    label={
                      <span className="text-base font-medium">
                        Do you have any Health Conditions?
                      </span>
                    }
                    className="mb-6"
                  >
                    <div className="flex gap-4">
                      <Button
                        type={noConditionsSelected ? "default" : "primary"}
                        onClick={showModal}
                        className={`rounded-lg ${
                          !noConditionsSelected
                            ? "bg-blue-600 hover:bg-blue-700 border-0 text-white"
                            : "border-gray-300"
                        } px-6 h-10 flex items-center ${
                          !noConditionsSelected ? "shadow-md" : ""
                        }`}
                        style={
                          !noConditionsSelected
                            ? { backgroundColor: "#4285F4" }
                            : {}
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Select conditions
                      </Button>
                      <Button
                        className={`rounded-lg ${
                          noConditionsSelected
                            ? "bg-blue-600 text-white border-0"
                            : "border-gray-300"
                        } hover:border-gray-400 h-10 flex items-center ${
                          noConditionsSelected ? "shadow-md" : ""
                        }`}
                        onClick={handleNoConditions}
                        style={
                          noConditionsSelected
                            ? { backgroundColor: "#4285F4" }
                            : {}
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 mr-2 ${
                            noConditionsSelected
                              ? "text-white"
                              : "text-green-600"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        No conditions
                      </Button>
                    </div>
                    {selectedConditions.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg animate-fadeIn">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm text-blue-700 font-medium">
                            {selectedConditions.length} condition
                            {selectedConditions.length !== 1 ? "s" : ""}{" "}
                            selected
                          </p>
                        </div>
                      </div>
                    )}
                  </Form.Item>

                  {/* Gender */}
                  <Form.Item
                    label={
                      <span className="text-base font-medium">Gender</span>
                    }
                    name="gender"
                    rules={[
                      { required: true, message: "Please select your gender" },
                    ]}
                    className="mb-6"
                  >
                    <Radio.Group className="flex flex-wrap gap-4 w-full">
                      {[
                        { value: "Male", icon: "M" },
                        { value: "Female", icon: "F" },
                        { value: "Other", icon: "O" },
                      ].map((option) => (
                        <Radio
                          key={option.value}
                          value={option.value}
                          className="custom-radio"
                        >
                          <div
                            className={`
          p-4 rounded-xl border-2 text-center transition-all duration-200 w-full
          ${
            selectedGender === option.value
              ? "border-blue-500 bg-blue-50 shadow-sm"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }
        `}
                          >
                            <div
                              className={`
            w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2
            ${
              selectedGender === option.value
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-500"
            }
          `}
                            >
                              {option.icon}
                            </div>
                            <div
                              className={`
            font-medium
            ${
              selectedGender === option.value
                ? "text-blue-700"
                : "text-gray-700"
            }
          `}
                            >
                              {option.value}
                            </div>
                          </div>
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date of Birth */}
                    <Form.Item
                      label={
                        <span className="text-base font-medium">
                          Date of birth
                        </span>
                      }
                      name="dob"
                      rules={[
                        {
                          required: true,
                          message: "Please select your date of birth",
                        },
                      ]}
                      className="mb-4"
                    >
                      <DatePicker
                        className="w-full rounded-lg h-12 border-gray-300 hover:border-gray-400 shadow-sm"
                        format={dateFormat}
                        size="large"
                        placeholder="Select date"
                      />
                    </Form.Item>

                    {/* Weight */}
                    <Form.Item
                      label={
                        <span className="text-base font-medium">Weight</span>
                      }
                      name="weight"
                      rules={[
                        { required: true, message: "Please enter your weight" },
                        {
                          type: "number",
                          min: 30,
                          max: 300,
                          message:
                            "Please enter a valid weight between 30 and 300",
                        },
                      ]}
                      className="mb-4"
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        size="large"
                        className="rounded-lg h-12"
                        placeholder="Weight in kg"
                        min={30}
                        max={300}
                        addonAfter="kg"
                      />
                    </Form.Item>

                    {/* Height */}
                    <Form.Item
                      label={
                        <span className="text-base font-medium">Height</span>
                      }
                      name="height"
                      rules={[
                        { required: true, message: "Please enter your height" },
                        {
                          type: "number",
                          min: 100,
                          max: 250,
                          message:
                            "Please enter a valid height between 100 and 250 cm",
                        },
                      ]}
                      className="mb-4"
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        size="large"
                        className="rounded-lg h-12"
                        placeholder="Height in cm"
                        min={100}
                        max={250}
                        addonAfter="cm"
                      />
                    </Form.Item>
                  </div>
                </div>

                <Divider className="my-8" />

                {/* Section: Fitness Goals */}
                <div className="mb-8 pb-2">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Your Fitness Goals
                    </h3>
                  </div>

                  {/* Goal */}
                  <Form.Item
                    label={
                      <span className="text-base font-medium">
                        What is your goal?
                      </span>
                    }
                    name="goal"
                    rules={[
                      { required: true, message: "Please select your goal" },
                    ]}
                    className="mb-6"
                  >
                    <Radio.Group className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {[
                          {
                            value: "Fat Loss",
                            title: "Lose Weight",
                            desc: "Burn fat and get leaner",
                            icon: (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 mb-2 text-orange-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                              </svg>
                            ),
                          },
                          {
                            value: "Get Fit",
                            title: "Get Fit",
                            desc: "Improve overall fitness",
                            icon: (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 mb-2 text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                            ),
                          },
                          {
                            value: "Build Muscle",
                            title: "Build Muscle",
                            desc: "Gain strength and size",
                            icon: (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 mb-2 text-purple-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                />
                              </svg>
                            ),
                          },
                        ].map((goal) => (
                          <Radio
                            key={goal.value}
                            value={goal.value}
                            className="custom-radio"
                          >
                            <div
                              className={`
                              border-2 rounded-xl p-6 transition-all duration-200 ease-in-out
                              hover:shadow-md flex flex-col items-center justify-center h-full w-full
                              ${
                                selectedGoal === goal.value
                                  ? "border-blue-500 bg-blue-50 shadow-md"
                                  : "border-gray-200 hover:border-gray-300"
                              }
                            `}
                            >
                              {goal.icon}
                              <span className="text-lg font-semibold block text-center">
                                {goal.title}
                              </span>
                              <span className="text-sm text-gray-500 block text-center mt-1">
                                {goal.desc}
                              </span>
                            </div>
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>
                </div>

                <Divider className="my-8" />

                {/* Section: Body Measurements */}
                <div className="mb-6">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-purple-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Body Measurements (Optional)
                    </h3>
                  </div>

                  <div className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                    <p className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      These measurements are optional but help us track your
                      progress more accurately.
                    </p>
                  </div>

                  {/* Body Measurements - Upper Body */}
                  <div className="mb-4">
                    <h4 className="text-sm uppercase font-semibold text-gray-500 tracking-wider mb-4">
                      Upper Body
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Neck Size */}
                      <Form.Item
                        label={<span className="font-medium">Neck</span>}
                        name="neck_size"
                        className="mb-2"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          size="large"
                          className="rounded-lg"
                          placeholder="cm"
                          min={20}
                          max={100}
                        />
                      </Form.Item>

                      {/* Shoulder Size */}
                      <Form.Item
                        label={<span className="font-medium">Shoulders</span>}
                        name="shoulder_size"
                        className="mb-2"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          size="large"
                          className="rounded-lg"
                          placeholder="cm"
                          min={30}
                          max={200}
                        />
                      </Form.Item>

                      {/* Biceps Size */}
                      <Form.Item
                        label={<span className="font-medium">Biceps</span>}
                        name="biceps_size"
                        className="mb-2"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          size="large"
                          className="rounded-lg"
                          placeholder="cm"
                          min={15}
                          max={100}
                        />
                      </Form.Item>

                      {/* Forearm Size */}
                      <Form.Item
                        label={<span className="font-medium">Forearms</span>}
                        name="forearm_size"
                        className="mb-2"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          size="large"
                          className="rounded-lg"
                          placeholder="cm"
                          min={15}
                          max={100}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Body Measurements - Lower Body */}
                  <div>
                    <h4 className="text-sm uppercase font-semibold text-gray-500 tracking-wider mb-4">
                      Lower Body
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Hip Size */}
                      <Form.Item
                        label={<span className="font-medium">Hips</span>}
                        name="hip_size"
                        className="mb-2"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          size="large"
                          className="rounded-lg"
                          placeholder="cm"
                          min={50}
                          max={200}
                        />
                      </Form.Item>

                      {/* Thigh Size */}
                      <Form.Item
                        label={<span className="font-medium">Thighs</span>}
                        name="thigh_size"
                        className="mb-2"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          size="large"
                          className="rounded-lg"
                          placeholder="cm"
                          min={30}
                          max={100}
                        />
                      </Form.Item>

                      {/* Calves Size */}
                      <Form.Item
                        label={<span className="font-medium">Calves</span>}
                        name="claves_size"
                        className="mb-2"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          size="large"
                          className="rounded-lg"
                          placeholder="cm"
                          min={20}
                          max={100}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-12">
                  <Form.Item className="mb-0">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="rounded-lg font-semibold h-14 text-lg transition-all duration-300 transform hover:scale-105"
                      block
                      loading={loading}
                      style={{
                        backgroundColor: "#4285F4",
                        borderColor: "#4285F4",
                      }}
                    >
                      {loading
                        ? "Saving Your Profile..."
                        : "Start Your Fitness Journey"}
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </Spin>
          </Card>

          <div className="text-center mt-6 text-gray-500 text-sm">
            <p>OX-Fit • Your Personal Fitness Journey</p>
          </div>
        </div>
      </div>

      {/* Health Conditions Modal - Styled */}
      <Modal
        title={
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold">
              Select Health Conditions
            </span>
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        className="health-conditions-modal"
        okText="Confirm Selections"
        okButtonProps={{
          style: { backgroundColor: "#4285F4", borderColor: "#4285F4" },
          className: "rounded-lg font-medium",
        }}
        cancelButtonProps={{ className: "rounded-lg" }}
      >
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <p className="text-blue-700 flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              If your health condition is not listed below, please consult your
              trainer or doctor!
            </span>
          </p>
        </div>

        <Spin spinning={loading}>
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder={
              loading
                ? "Loading health conditions..."
                : "Select your health conditions"
            }
            onChange={handleHealthConditionChange}
            maxTagCount="responsive"
            className="rounded-lg text-base"
            size="large"
            listHeight={320}
          >
            {healthConditions.map((condition) => (
              <Option
                key={condition.condition_id}
                value={condition.condition_id}
              >
                {condition.condition_name}
              </Option>
            ))}
          </Select>
        </Spin>

        {selectedConditions.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg animate-fadeIn">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm text-green-700 font-medium">
                You've selected {selectedConditions.length} condition
                {selectedConditions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .ant-select-item-option-selected {
          background-color: #ebf5ff !important;
        }

        .ant-form-item-label > label {
          font-weight: 500;
        }

        .ant-input-number-input {
          height: 100% !important;
        }

        .ant-card {
          border-radius: 16px !important;
        }

        .user-info-form
          .ant-form-item-control-input-content
          .ant-input-number-affix-wrapper {
          padding: 0;
          border-radius: 8px;
          overflow: hidden;
        }

        .health-conditions-modal .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        /* Add the custom radio styles below - right here before the closing backticks */
        .custom-radio {
          width: 100% !important;
          margin-right: 0 !important;
          display: flex !important;
        }

        .custom-radio .ant-radio {
          position: absolute !important;
          top: 12px !important;
          left: 12px !important;
          z-index: 10 !important;
        }

        .custom-radio .ant-radio + * {
          padding-left: 0 !important;
          width: 100% !important;
        }

        .ant-radio-wrapper {
          width: 100% !important;
          margin-right: 0 !important;
        }

        .ant-radio-wrapper-in-form-item {
          display: flex !important;
          width: 100% !important;
        }

        /* Make sure input is clickable */
        .ant-radio-input {
          z-index: 11 !important;
          width: 20px !important;
          height: 20px !important;
        }
      `}</style>
    </div>
  );
};
export default UserInfo;
