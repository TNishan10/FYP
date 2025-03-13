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
} from "antd";

const UserInfo = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { Option } = Select;
  const dateFormat = "YYYY-MM-DD";

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

  // Modal control functions
  const showModal = () => {
    setIsModalVisible(true);
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
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4 md:px-0">
        <div className="max-w-2xl mx-auto">
          <Card
            title={
              <h1 className="text-2xl font-bold text-center">
                Tell us about yourself
              </h1>
            }
            className="shadow-lg rounded-xl"
          >
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
              >
                {/* Health Conditions */}
                <Form.Item label="Do you have any Health Conditions?">
                  <div className="flex gap-4">
                    <Button
                      type="primary"
                      onClick={showModal}
                      className="rounded-lg"
                    >
                      Yes, select conditions
                    </Button>
                    <Button className="rounded-lg">No</Button>
                  </div>
                  {selectedConditions.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-600">
                        Selected conditions: {selectedConditions.length}
                      </p>
                    </div>
                  )}
                </Form.Item>

                {/* Gender */}
                <Form.Item
                  label="Gender"
                  name="gender"
                  rules={[
                    { required: true, message: "Please select your gender" },
                  ]}
                >
                  <Radio.Group>
                    <Radio value="Male">Male</Radio>
                    <Radio value="Female">Female</Radio>
                    <Radio value="Other">Other</Radio>
                  </Radio.Group>
                </Form.Item>

                {/* Date of Birth */}
                <Form.Item
                  label="Date of birth"
                  name="dob"
                  rules={[
                    {
                      required: true,
                      message: "Please select your date of birth",
                    },
                  ]}
                >
                  <DatePicker
                    className="w-full rounded-lg"
                    format={dateFormat}
                    size="large"
                  />
                </Form.Item>

                {/* Weight */}
                <Form.Item
                  label="Weight (kg)"
                  name="weight"
                  rules={[
                    { required: true, message: "Please enter your weight" },
                    {
                      type: "number",
                      min: 30,
                      max: 300,
                      message: "Please enter a valid weight between 30 and 300",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    className="rounded-lg"
                    placeholder="Enter your weight in kg"
                    min={30}
                    max={300}
                  />
                </Form.Item>

                {/* Height */}
                <Form.Item
                  label="Height (cm)"
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
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    className="rounded-lg"
                    placeholder="Enter your height in cm"
                    min={100}
                    max={250}
                  />
                </Form.Item>

                {/* Goal */}
                <Form.Item
                  label="What is your goal?"
                  name="goal"
                  rules={[
                    { required: true, message: "Please select your goal" },
                  ]}
                >
                  <Radio.Group>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div className="border rounded-xl p-4 hover:bg-blue-50 cursor-pointer">
                        <Radio value="Fat Loss" className="w-full h-full">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-medium">
                              Lose Weight
                            </span>
                            <span className="text-sm text-gray-500">
                              Burn fat and get leaner
                            </span>
                          </div>
                        </Radio>
                      </div>
                      <div className="border rounded-xl p-4 hover:bg-blue-50 cursor-pointer">
                        <Radio value="Get Fit" className="w-full h-full">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-medium">Get Fit</span>
                            <span className="text-sm text-gray-500">
                              Improve overall fitness
                            </span>
                          </div>
                        </Radio>
                      </div>
                      <div className="border rounded-xl p-4 hover:bg-blue-50 cursor-pointer">
                        <Radio value="Build Muscle" className="w-full h-full">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-medium">
                              Build Muscle
                            </span>
                            <span className="text-sm text-gray-500">
                              Gain strength and size
                            </span>
                          </div>
                        </Radio>
                      </div>
                    </div>
                  </Radio.Group>
                </Form.Item>

                {/* Neck Size */}
                <Form.Item label="Neck Size (cm)" name="neck_size">
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    className="rounded-lg"
                    placeholder="Enter your neck size in cm"
                  />
                </Form.Item>

                {/* Shoulder Size */}
                <Form.Item label="Shoulder Size (cm)" name="shoulder_size">
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    className="rounded-lg"
                    placeholder="Enter your shoulder size in cm"
                  />
                </Form.Item>

                {/* Forearm Size */}
                <Form.Item label="Forearm Size (cm)" name="forearm_size">
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    className="rounded-lg"
                    placeholder="Enter your forearm size in cm"
                  />
                </Form.Item>

                {/* Biceps Size */}
                <Form.Item label="Biceps Size (cm)" name="biceps_size">
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    className="rounded-lg"
                    placeholder="Enter your biceps size in cm"
                  />
                </Form.Item>

                {/* Hip Size */}
                <Form.Item label="Hip Size (cm)" name="hip_size">
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    className="rounded-lg"
                    placeholder="Enter your hip size in cm"
                  />
                </Form.Item>

                {/* Thigh Size */}
                <Form.Item label="Thigh Size (cm)" name="thigh_size">
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    className="rounded-lg"
                    placeholder="Enter your thigh size in cm"
                  />
                </Form.Item>

                {/* Calves Size */}
                <Form.Item label="Calves Size (cm)" name="claves_size">
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    className="rounded-lg"
                    placeholder="Enter your calves size in cm"
                  />
                </Form.Item>

                {/* Submit Button */}
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="rounded-lg font-medium"
                    block
                    loading={loading}
                  >
                    Start Your Fitness Journey
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </div>
      </div>

      {/* Health Conditions Modal */}
      <Modal
        title="Select Health Conditions"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        className="health-conditions-modal"
      >
        <p className="text-blue-600 mb-4">
          If your health condition is not listed below, please consult your
          trainer or doctor!
        </p>
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
      </Modal>
    </div>
  );
};

export default UserInfo;
