import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import {
  Button,
  Modal,
  Select,
  Typography,
  Popover,
  Divider,
  Radio,
  Form,
  Input,
  DatePicker,
  Card,
  Spin,
  Space,
  Tag,
} from "antd";
import { toast } from "react-toastify";
import Chart from "../components/Charts/Chart.jsx";
import {
  UserOutlined,
  CalendarOutlined,
  ColumnHeightOutlined,
  LineChartOutlined,
  FileTextOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const Dashboard = () => {
  const navigate = useNavigate();
  const { Paragraph } = Typography;
  const { Option } = Select;
  const [form] = Form.useForm();
  const dateFormat = "YYYY-MM-DD";

  // User state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    userId: "",
    dob: "",
    height: "",
    weight: "",
    goal: "Get Fit",
    neckSize: "",
    shoulderSize: "",
    forearmSize: "",
    bicepsSize: "",
    hipSize: "",
    thighSize: "",
    calvesSize: "",
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [BMI, setBMI] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [healthConditions, setHealthConditions] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);

  // Custom health conditions
  const [customCondition, setCustomCondition] = useState("");
  const [customConditions, setCustomConditions] = useState([]);

  // Temp form values
  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMeasureModalVisible, setIsMeasureModalVisible] = useState(false);
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [userNotes, setUserNotes] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  // Add at the beginning of the component after other state declarations
  const [editableUserData, setEditableUserData] = useState({
    name: "",
    dob: "",
    weight: "",
    height: "",
  });

  // Add inside the component to handle editable fields
  const handleEditFieldChange = (field, value) => {
    setEditableUserData((prev) => ({ ...prev, [field]: value }));
  };

  // Add this useEffect to update editable data when isEditMode changes
  useEffect(() => {
    if (isEditMode) {
      setEditableUserData({
        name: userData.name,
        dob: userData.dob,
        weight: userData.weight,
        height: userData.height,
      });
    }
  }, [isEditMode, userData]);

  // Add this function to save edited profile
  const saveEditedProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      // Update user basic info if name changed
      if (editableUserData.name !== userData.name) {
        await axios.put(
          `http://localhost:8000/api/v1/auth/users/${userId}`,
          { user_name: editableUserData.name },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      const userInfoResponse = await axios.get(
        `http://localhost:8000/api/v1/auth/users/${userId}/info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (userInfoResponse.data.success) {
        // Get the user_info_id from the response
        const userInfoId = userInfoResponse.data.data.user_info_id;

        // Update other user info fields
        const updateData = {};
        if (editableUserData.weight)
          updateData.weight = editableUserData.weight;
        if (editableUserData.height)
          updateData.height = editableUserData.height;
        if (editableUserData.dob) updateData.dob = editableUserData.dob;

        if (Object.keys(updateData).length > 0) {
          await axios.put(
            `http://localhost:8000/api/v1/auth/user-info/${userInfoId}`, // Use userInfoId instead of userId
            updateData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        // Update local userData state
        setUserData((prev) => ({
          ...prev,
          name: editableUserData.name,
          weight: editableUserData.weight || prev.weight,
          height: editableUserData.height || prev.height,
          dob: editableUserData.dob || prev.dob,
        }));

        toast.success("Profile updated successfully");
        setIsEditMode(false);
      } else {
        toast.error("Could not find user information");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        `Failed to update profile: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };
  // Fetch user data
  useEffect(() => {
    const fetchNumericUserId = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8000/api/v1/auth/user-numeric-id/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success && response.data.numericId) {
          localStorage.setItem("numericUserId", response.data.numericId);
        }
      } catch (err) {
        console.error("Could not fetch numeric ID", err);
      }
    };
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        if (!userId || !token) {
          toast.error("Authentication required");
          navigate("/login");
          return;
        }

        // Fetch basic user data
        const userResponse = await axios.get(
          `http://localhost:8000/api/v1/auth/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (userResponse.data.success) {
          const user = userResponse.data.data;

          // Check if user is admin
          setIsAdmin(user.role === "admin");

          // Update userData with basic info
          setUserData((prevData) => ({
            ...prevData,
            name: user.user_name,
            email: user.user_email,
            userId: user.user_id,
          }));

          // Fetch user's detailed info
          try {
            const userInfoResponse = await axios.get(
              `http://localhost:8000/api/v1/auth/users/${userId}/info`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (userInfoResponse.data.success) {
              const userInfo = userInfoResponse.data.data;

              setUserData((prevData) => ({
                ...prevData,
                dob: userInfo.dob,
                height: userInfo.height,
                weight: userInfo.weight,
                goal: userInfo.goal || "Get Fit",
                neckSize: userInfo.neck_size,
                shoulderSize: userInfo.shoulder_size,
                forearmSize: userInfo.forearm_size,
                bicepsSize: userInfo.biceps_size,
                hipSize: userInfo.hip_size,
                thighSize: userInfo.thigh_size,
                calvesSize: userInfo.claves_size,
              }));
            }
          } catch (infoError) {
            console.error("Error fetching user info:", infoError);
            // If user doesn't have info yet, redirect to info page
            if (infoError.response?.status === 404) {
              toast.info("Please complete your profile information");
              navigate("/user/info");
            }
          }

          // Fetch available health conditions
          try {
            const conditionsResponse = await axios.get(
              "http://localhost:8000/api/v1/auth/health-conditions",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (conditionsResponse.data.success) {
              setHealthConditions(conditionsResponse.data.data);
            }
          } catch (conditionsError) {
            console.error("Error fetching health conditions:", conditionsError);
          }

          // Fetch user's selected health conditions
          try {
            const userHealthResponse = await axios.get(
              `http://localhost:8000/api/v1/auth/users/${userId}/health-conditions`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (userHealthResponse.data.success) {
              const userHealthConditions = userHealthResponse.data.data;
              setSelectedConditions(
                userHealthConditions.map((condition) => condition.condition_id)
              );
            }
          } catch (healthError) {
            console.error(
              "Error fetching user health conditions:",
              healthError
            );
          }
        } else {
          toast.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error loading your profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (userData.weight && userData.height) {
      const heightInMeters = userData.height / 100;
      const bmiValue = (
        userData.weight /
        (heightInMeters * heightInMeters)
      ).toFixed(1);
      setBMI(bmiValue);
    }
  }, [userData.weight, userData.height]);

  // Modal handlers
  const showModal = () => setIsModalVisible(true);
  const showMeasureModal = () => setIsMeasureModalVisible(true);
  const showDateModal = () => setIsDateModalVisible(true);
  const showNotesModal = () => setIsNotesModalVisible(true);

  const handleModalOk = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      // Update user health conditions
      await axios.put(
        `http://localhost:8000/api/v1/auth/users/${userId}/health-conditions`,
        { condition_ids: selectedConditions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Health conditions updated successfully");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error updating health conditions:", error);
      toast.error("Failed to update health conditions");
    } finally {
      setLoading(false);
    }
  };

  const handleMeasureModalOk = () => setIsMeasureModalVisible(false);
  const handleDateModalOk = () => setIsDateModalVisible(false);

  const handleNotesModalOk = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      await axios.post(
        `http://localhost:8000/api/v1/auth/user-notes`,
        {
          user_id: userId,
          notes: userNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Notes saved successfully");
      setIsNotesModalVisible(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    }
  };

  const handleModalCancel = () => setIsModalVisible(false);
  const handleMeasureModalCancel = () => setIsMeasureModalVisible(false);
  const handleDateModalCancel = () => setIsDateModalVisible(false);
  const handleNotesModalCancel = () => setIsNotesModalVisible(false);

  // Health condition handlers
  const handleHealthConditionChange = (values) => {
    setSelectedConditions(values);
  };

  // Custom health condition handlers
  const handleAddCustomCondition = () => {
    if (customCondition.trim() !== "") {
      const newCondition = {
        condition_id: `custom_${Date.now()}`,
        condition_name: customCondition.trim(),
        isCustom: true,
      };

      setCustomConditions([...customConditions, newCondition]);
      setCustomCondition("");
      toast.success("Custom health condition added");
    }
  };

  const handleRemoveCustomCondition = (conditionToRemove) => {
    setCustomConditions(
      customConditions.filter(
        (condition) => condition.condition_id !== conditionToRemove.condition_id
      )
    );
  };

  // Date change handler
  const handleDateChange = async (date, dateString) => {
    try {
      const userId = localStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      // Update user's date of birth
      await axios.put(
        `http://localhost:8000/api/v1/auth/user-info/${userId}`,
        { dob: dateString },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData((prev) => ({ ...prev, dob: dateString }));
      toast.success("Date of birth updated successfully");
      setIsDateModalVisible(false);
    } catch (error) {
      console.error("Error updating date of birth:", error);
      toast.error("Failed to update date of birth");
    }
  };

  // Validate weight input
  const validateWeight = (value) => {
    setWeightInput(value);
    if (value && (isNaN(value) || value <= 0 || value > 500)) {
      setWeightError("Please enter a valid weight (1-500 kg)");
      return false;
    } else {
      setWeightError("");
      return true;
    }
  };

  // Validate height input
  const validateHeight = (value) => {
    setHeightInput(value);
    if (value && (isNaN(value) || value <= 0 || value > 300)) {
      setHeightError("Please enter a valid height (1-300 cm)");
      return false;
    } else {
      setHeightError("");
      return true;
    }
  };

  const updateHeightWeight = async () => {
    // Validate inputs
    const isWeightValid = validateWeight(weightInput);
    const isHeightValid = validateHeight(heightInput);

    if (!weightInput && !heightInput) {
      toast.error("Please enter height or weight to update");
      return;
    }

    if ((!isWeightValid && weightInput) || (!isHeightValid && heightInput)) {
      toast.error("Please correct the invalid inputs");
      return;
    }

    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      // First get the user_info_id
      const userInfoResponse = await axios.get(
        `http://localhost:8000/api/v1/auth/users/${userId}/info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userInfoResponse.data.success) {
        toast.error("Could not find user information");
        return;
      }

      // Get the user_info_id from the response
      const userInfoId = userInfoResponse.data.data.user_info_id;

      const updateData = {};
      if (weightInput) updateData.weight = weightInput;
      if (heightInput) updateData.height = heightInput;

      // Update user info using the correct userInfoId
      await axios.put(
        `http://localhost:8000/api/v1/auth/user-info/${userInfoId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData((prev) => ({
        ...prev,
        height: heightInput || prev.height,
        weight: weightInput || prev.weight,
      }));

      toast.success("Body metrics updated successfully");
      setHeightInput("");
      setWeightInput("");
    } catch (error) {
      console.error("Error updating body metrics:", error);
      toast.error(
        `Failed to update body metrics: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Update user goal
  const handleGoalChange = async (e) => {
    const newGoal = e.target.value;

    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required");
        navigate("/login");
        return;
      }

      // Step 1: Get the user info to obtain the user_info_id
      const userInfoResponse = await axios.get(
        `http://localhost:8000/api/v1/auth/users/${userId}/info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if user info was found
      if (!userInfoResponse.data.success) {
        toast.error("User profile information not found");
        return;
      }

      // Get the user_info_id from the response
      const userInfoId = userInfoResponse.data.data.user_info_id;

      // Step 2: Update the goal using the numeric user_info_id
      const response = await axios.put(
        `http://localhost:8000/api/v1/auth/user-info/${userInfoId}`,
        { goal: newGoal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUserData((prev) => ({ ...prev, goal: newGoal }));
        toast.success("Fitness goal updated successfully");
      } else {
        toast.error("Failed to update fitness goal");
      }
    } catch (error) {
      console.error("Error updating goal:", error);

      if (error.response) {
        console.error("Server responded with:", error.response.data);

        if (error.response.status === 404) {
          toast.error(
            "User profile not found. Please complete your profile setup first."
          );
        } else {
          toast.error(
            `Failed to update fitness goal: ${
              error.response?.data?.message || "Server error"
            }`
          );
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update body measurements
  const updateBodyMeasurements = async (values) => {
    try {
      // Validate measurements
      for (const key in values) {
        // Convert to number first before validation
        const numValue = Number(values[key]);
        if (
          values[key] &&
          (isNaN(numValue) || numValue <= 0 || numValue > 300)
        ) {
          toast.error(`Please enter a valid measurement for ${key} (1-300 cm)`);
          return;
        }
      }
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      const userInfoResponse = await axios.get(
        `http://localhost:8000/api/v1/auth/users/${userId}/info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!userInfoResponse.data.success) {
        toast.error("Could not find user information");
        return;
      }
      const userInfoId = userInfoResponse.data.data.user_info_id;
      const measurements = {
        neck_size: values.neck,
        shoulder_size: values.shoulder,
        forearm_size: values.forearm,
        biceps_size: values.biceps,
        hip_size: values.hip,
        thigh_size: values.thigh,
        claves_size: values.claves,
      };

      // Update user body measurements
      await axios.put(
        `http://localhost:8000/api/v1/auth/user-info/${userInfoId}`, // Use userInfoId instead of userId
        measurements,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData((prev) => ({
        ...prev,
        neckSize: values.neck,
        shoulderSize: values.shoulder,
        forearmSize: values.forearm,
        bicepsSize: values.biceps,
        hipSize: values.hip,
        thighSize: values.thigh,
        calvesSize: values.claves,
      }));

      toast.success("Body measurements updated successfully");
      setIsMeasureModalVisible(false);
    } catch (error) {
      console.error("Error updating body measurements:", error);
      toast.error(
        `Failed to update measurements: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    const isWeightValid = validateWeight(weightInput);
    const isHeightValid = validateHeight(heightInput);

    if (!weightInput || !heightInput) {
      toast.error("Please enter both height and weight");
      return;
    }

    if (!isWeightValid || !isHeightValid) {
      toast.error("Please correct the invalid inputs");
      return;
    }

    const heightInMeters = heightInput / 100;
    const bmiValue = (weightInput / (heightInMeters * heightInMeters)).toFixed(
      1
    );
    setBMI(bmiValue);
  };

  // BMI interpretation content with program recommendations
  const bmiPopoverContent = (
    <div>
      {BMI <= 18.5 && (
        <div>
          <p className="text-blue-700 font-medium mb-2">Underweight</p>
          <p className="mb-4">Your BMI indicates you're underweight.</p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold text-blue-800 mb-1">
              Recommended Program:
            </p>
            <p className="text-blue-700">
              <strong>Muscle Building Program</strong> - Focus on strength
              training and increasing your caloric intake with protein-rich
              foods.
            </p>
          </div>
        </div>
      )}
      {BMI > 18.5 && BMI <= 24.9 && (
        <div>
          <p className="text-green-600 font-medium mb-2">Normal Weight</p>
          <p className="mb-4">Your BMI is in a healthy range.</p>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="font-semibold text-green-800 mb-1">
              Recommended Program:
            </p>
            <p className="text-green-700">
              <strong>General Fitness Program</strong> - Focus on maintaining
              your weight with balanced workouts combining cardio and strength
              training.
            </p>
          </div>
        </div>
      )}
      {BMI > 25 && BMI < 29.9 && (
        <div>
          <p className="text-orange-500 font-medium mb-2">Overweight</p>
          <p className="mb-4">Your BMI indicates you're overweight.</p>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="font-semibold text-orange-800 mb-1">
              Recommended Program:
            </p>
            <p className="text-orange-700">
              <strong>Weight Management Program</strong> - Focus on caloric
              deficit through cardio exercises and a balanced diet with portion
              control.
            </p>
          </div>
        </div>
      )}
      {BMI >= 30 && (
        <div>
          <p className="text-red-600 font-medium mb-2">Obesity</p>
          <p className="mb-4">Your BMI indicates obesity.</p>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="font-semibold text-red-800 mb-1">
              Recommended Program:
            </p>
            <p className="text-red-700">
              <strong>Weight Loss Program</strong> - Focus on increasing daily
              activity level, low-impact cardio, and gradual strength training
              with a caloric deficit diet plan.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Deactivate account
  const deactivateAccount = async () => {
    try {
      if (
        window.confirm(
          "Are you sure you want to deactivate your account? This action cannot be undone."
        )
      ) {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        await axios.put(
          `http://localhost:8000/api/v1/auth/users/${userId}`,
          { is_active: false },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Account deactivated successfully");
        localStorage.removeItem("userId");
        sessionStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
      toast.error("Failed to deactivate account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-10">
      {isAdmin && (
        <div className="fixed bg-gradient-to-r from-blue-600 to-indigo-700 p-2 px-6 rounded-xl z-10 bottom-5 right-5 m-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <Link to="/admin" className="text-white font-semibold">
            Admin Panel
          </Link>
        </div>
      )}

      <Spin spinning={loading} tip="Loading your data..." size="large">
        <Modal
          title={
            <span className="text-xl font-medium">Change Date of Birth</span>
          }
          open={isDateModalVisible}
          onOk={handleDateModalOk}
          onCancel={handleDateModalCancel}
          centered
          styles={{ body: { padding: "24px" } }}
        >
          <DatePicker
            size="large"
            style={{ width: "100%", borderRadius: "12px", padding: "12px" }}
            onChange={handleDateChange}
            format={dateFormat}
          />
        </Modal>

        {/* Notes Modal */}
        <Modal
          title={<span className="text-xl font-medium">Your Notes</span>}
          open={isNotesModalVisible}
          onOk={handleNotesModalOk}
          onCancel={handleNotesModalCancel}
          width={600}
          centered
          styles={{ body: { padding: "24px" } }}
        >
          <p className="text-lg font-medium text-purple-900 mb-4">
            Write down your fitness notes, goals or reminders:
          </p>
          <Input.TextArea
            rows={6}
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Start writing your notes here..."
            style={{ borderRadius: "8px", fontSize: "16px" }}
          />
        </Modal>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <h1 className="text-3xl font-semibold mt-5 mb-2 text-center text-gray-800 animate__animated animate__fadeIn">
            Hello {userData.name} 👋
          </h1>

          <div className="mb-4">
            <h1 className="text-3xl tracking-wide text-gray-700 text-center py-2 font-light">
              Welcome to{" "}
              <span className="font-bold text-indigo-600 bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                OX-Strength Training Ground
              </span>
            </h1>
          </div>

          {/* User profile card */}
          <div className="flex flex-col items-center mb-10">
            <Card
              className="w-full md:w-4/5 lg:w-3/4 bg-white rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl"
              styles={{ body: { padding: "24px" } }}
            >
              <h1 className="text-2xl font-semibold mb-6 text-gray-800 text-center border-b border-gray-100 pb-4">
                User Profile
              </h1>

              <div className="flex flex-col md:flex-row justify-between">
                <div className="hidden md:flex md:flex-shrink-0 md:items-center md:justify-center md:mr-8">
                  <div className="w-56 h-56 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                    <img
                      src="/icons/User.svg"
                      alt="User"
                      className="w-40 h-40 opacity-90"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://cdn-icons-png.flaticon.com/512/1077/1077114.png";
                      }}
                    />
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="space-y-5">
                    <p className="flex items-center text-lg text-gray-700">
                      <UserOutlined className="text-xl text-indigo-500 mr-4" />
                      <span className="font-medium w-32">Name:</span>
                      {isEditMode ? (
                        <Input
                          value={editableUserData.name}
                          onChange={(e) =>
                            handleEditFieldChange("name", e.target.value)
                          }
                          className="flex-grow"
                          style={{ maxWidth: "250px" }}
                        />
                      ) : (
                        <span className="text-gray-800">{userData.name}</span>
                      )}
                    </p>

                    <p className="flex items-center text-lg text-gray-700">
                      <CalendarOutlined className="text-xl text-indigo-500 mr-4" />
                      <span className="font-medium w-32">Date of birth:</span>
                      {isEditMode ? (
                        <DatePicker
                          defaultValue={
                            userData.dob
                              ? moment(userData.dob, dateFormat)
                              : null
                          }
                          format={dateFormat}
                          onChange={(date, dateString) =>
                            handleEditFieldChange("dob", dateString)
                          }
                          style={{ maxWidth: "250px" }}
                        />
                      ) : (
                        <>
                          <span className="text-gray-800">
                            {userData.dob
                              ? userData.dob.slice(0, 10)
                              : "Not specified"}
                          </span>
                          {!isEditMode && (
                            <button
                              onClick={showDateModal}
                              className="ml-4 text-blue-500 hover:text-blue-700 hover:underline transition-colors duration-200 text-sm cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                        </>
                      )}
                    </p>
                    <p className="flex items-center text-lg text-gray-700">
                      <LineChartOutlined className="text-xl text-indigo-500 mr-4" />
                      <span className="font-medium w-32">Weight:</span>
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={editableUserData.weight}
                          onChange={(e) =>
                            handleEditFieldChange("weight", e.target.value)
                          }
                          className="flex-grow"
                          style={{ maxWidth: "250px" }}
                          addonAfter="kg"
                        />
                      ) : (
                        <span className="text-gray-800">
                          {userData.weight} kg
                        </span>
                      )}
                    </p>

                    <p className="flex items-center text-lg text-gray-700">
                      <ColumnHeightOutlined className="text-xl text-indigo-500 mr-4" />
                      <span className="font-medium w-32">Height:</span>
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={editableUserData.height}
                          onChange={(e) =>
                            handleEditFieldChange("height", e.target.value)
                          }
                          className="flex-grow"
                          style={{ maxWidth: "250px" }}
                          addonAfter="cm"
                        />
                      ) : (
                        <span className="text-gray-800">
                          {userData.height} cm
                        </span>
                      )}
                    </p>

                    <p className="flex items-center text-lg text-gray-700 hover:text-indigo-600 transition-colors duration-200">
                      <FileTextOutlined className="text-xl text-indigo-500 mr-4" />
                      <span className="font-medium w-32">Your Notes</span>
                      <button
                        onClick={showNotesModal}
                        className="text-blue-500 hover:underline cursor-pointer"
                      >
                        Check
                      </button>
                    </p>

                    <div className="hidden md:flex items-center text-lg text-gray-700">
                      <IdcardOutlined className="text-xl text-indigo-500 mr-4" />
                      <span className="font-medium w-32">User ID:</span>
                      <Paragraph
                        style={{ marginBottom: 0, paddingTop: "2px" }}
                        copyable={{ tooltips: ["Copy ID", "Copied!"] }}
                      >
                        {userData.userId}
                      </Paragraph>
                    </div>
                  </div>
                </div>
              </div>

              <div className="my-6 text-center">
                {isEditMode ? (
                  <div className="space-x-4">
                    <Button
                      onClick={saveEditedProfile}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                      style={{ height: "44px" }}
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditMode(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg"
                      style={{ height: "44px" }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditMode(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                    style={{ height: "44px" }}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="px-4">
                <div className="mb-8">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">
                    Change your fitness goal
                  </h2>
                  <Radio.Group
                    name="radiogroup"
                    onChange={handleGoalChange}
                    value={userData.goal}
                    className="space-x-6"
                    size="large"
                  >
                    <Radio value="Fat Loss" className="text-base">
                      Lose Weight
                    </Radio>
                    <Radio value="Get Fit" className="text-base">
                      Get Fit
                    </Radio>
                    <Radio value="Build Muscle" className="text-base">
                      Build Muscle
                    </Radio>
                  </Radio.Group>
                </div>

                <div className="mb-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-gray-700">
                        Weight:
                      </label>
                      <div className="flex flex-col">
                        <Input
                          type="number"
                          value={weightInput}
                          onChange={(e) => validateWeight(e.target.value)}
                          style={{
                            borderRadius: "12px",
                            height: "50px",
                            fontSize: "16px",
                          }}
                          status={weightError ? "error" : ""}
                          allowClear
                          placeholder="Weight in kg"
                          prefix={
                            <LineChartOutlined className="text-indigo-500 mr-2" />
                          }
                        />
                        {weightError && (
                          <div className="text-red-500 text-sm mt-1">
                            {weightError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-gray-700">
                        Height:
                      </label>
                      <div className="flex flex-col">
                        <Input
                          type="number"
                          value={heightInput}
                          onChange={(e) => validateHeight(e.target.value)}
                          style={{
                            borderRadius: "12px",
                            height: "50px",
                            fontSize: "16px",
                          }}
                          status={heightError ? "error" : ""}
                          allowClear
                          placeholder="Height in cm"
                          prefix={
                            <ColumnHeightOutlined className="text-indigo-500 mr-2" />
                          }
                        />
                        {heightError && (
                          <div className="text-red-500 text-sm mt-1">
                            {heightError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  <Button
                    style={{
                      background: "linear-gradient(to right, #4f46e5, #6366f1)",
                      borderRadius: "12px",
                      height: "48px",
                      border: "none",
                      padding: "0 24px",
                      boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)",
                    }}
                    onClick={updateHeightWeight}
                    className="hover:opacity-90 transition-opacity duration-200"
                  >
                    <p className="text-base font-medium text-white">
                      Save Changes
                    </p>
                  </Button>

                  <Button
                    style={{
                      background: "linear-gradient(to right, #4f46e5, #6366f1)",
                      borderRadius: "12px",
                      height: "48px",
                      border: "none",
                      padding: "0 24px",
                      boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)",
                    }}
                    onClick={showModal}
                    className="hover:opacity-90 transition-opacity duration-200"
                  >
                    <p className="text-base font-medium text-white">
                      Health Conditions
                    </p>
                  </Button>

                  <Button
                    style={{
                      background: "linear-gradient(to right, #4f46e5, #6366f1)",
                      borderRadius: "12px",
                      height: "48px",
                      border: "none",
                      padding: "0 24px",
                      boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)",
                    }}
                    onClick={showMeasureModal}
                    className="hover:opacity-90 transition-opacity duration-200"
                  >
                    <p className="text-base font-medium text-white">
                      Body Measurements
                    </p>
                  </Button>
                </div>

                <div className="flex flex-wrap pt-3 flex-col">
                  <button
                    className="text-center text-red-500 font-medium transition-colors duration-200 cursor-pointer hover:text-red-700"
                    onClick={deactivateAccount}
                  >
                    Deactivate account
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Body metric section */}
          <div className="py-6 bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl shadow-inner mb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
                Body Metrics
              </h1>

              <div className="flex flex-col items-center mb-10">
                {/* Pass user body measurements as props to the Chart component */}
                <Chart
                  userData={userData}
                  key={`chart-${userData.neckSize}-${userData.shoulderSize}-${userData.forearmSize}-${userData.bicepsSize}-${userData.hipSize}-${userData.thighSize}-${userData.calvesSize}`}
                />
              </div>

              <div className="flex flex-col items-center">
                <Card
                  className="w-full md:w-4/5 lg:w-3/4 bg-white rounded-xl shadow-xl"
                  styles={{ body: { padding: "24px" } }}
                >
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Calculate BMI
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-gray-700">
                        Weight:
                      </label>
                      <div className="flex flex-col">
                        <Input
                          type="number"
                          value={weightInput}
                          onChange={(e) => validateWeight(e.target.value)}
                          style={{
                            borderRadius: "12px",
                            height: "50px",
                            fontSize: "16px",
                          }}
                          status={weightError ? "error" : ""}
                          allowClear
                          placeholder="Weight in kg"
                          prefix={
                            <LineChartOutlined className="text-indigo-500 mr-2" />
                          }
                        />
                        {weightError && (
                          <div className="text-red-500 text-sm mt-1">
                            {weightError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-gray-700">
                        Height:
                      </label>
                      <div className="flex flex-col">
                        <Input
                          type="number"
                          value={heightInput}
                          onChange={(e) => validateHeight(e.target.value)}
                          style={{
                            borderRadius: "12px",
                            height: "50px",
                            fontSize: "16px",
                          }}
                          status={heightError ? "error" : ""}
                          allowClear
                          placeholder="Height in cm"
                          prefix={
                            <ColumnHeightOutlined className="text-indigo-500 mr-2" />
                          }
                        />
                        {heightError && (
                          <div className="text-red-500 text-sm mt-1">
                            {heightError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <p className="text-xl font-medium mr-3">BMI:</p>
                    <span
                      className={`text-xl font-bold ${
                        BMI <= 18.5
                          ? "text-blue-600"
                          : BMI <= 24.9
                          ? "text-green-600"
                          : BMI < 30
                          ? "text-orange-500"
                          : "text-red-600"
                      }`}
                    >
                      {BMI || "—"}
                    </span>
                    {BMI && (
                      <Popover
                        content={bmiPopoverContent}
                        title={
                          <span className="font-medium">BMI Information</span>
                        }
                        placement="right"
                      >
                        <Button
                          type="primary"
                          className="ml-4"
                          style={{
                            borderRadius: "8px",
                            background:
                              "linear-gradient(to right, #4f46e5, #6366f1)",
                          }}
                        >
                          Health Tips
                        </Button>
                      </Popover>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button
                      style={{
                        background:
                          "linear-gradient(to right, #4f46e5, #6366f1)",
                        borderRadius: "12px",
                        height: "48px",
                        border: "none",
                        padding: "0 24px",
                        boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)",
                      }}
                      onClick={showMeasureModal}
                      className="hover:opacity-90 transition-opacity duration-200"
                    >
                      <p className="text-base font-medium text-white">
                        Body Measurements
                      </p>
                    </Button>

                    <Button
                      style={{
                        background:
                          "linear-gradient(to right, #4f46e5, #6366f1)",
                        borderRadius: "12px",
                        height: "48px",
                        border: "none",
                        padding: "0 24px",
                        boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)",
                      }}
                      onClick={calculateBMI}
                      className="hover:opacity-90 transition-opacity duration-200"
                    >
                      <p className="text-base font-medium text-white">
                        Calculate BMI
                      </p>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Health Conditions Modal */}
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
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
          className="health-conditions-modal"
          centered
          styles={{ body: { padding: "24px" } }}
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
                Select from the list below or add your own health condition if
                it's not listed.
              </span>
            </p>
          </div>

          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Select your health conditions"
            onChange={handleHealthConditionChange}
            value={selectedConditions}
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

          <div className="mt-4 mb-2">
            <h4 className="text-base font-medium text-gray-700 mb-2">
              Add a custom health condition
            </h4>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Enter your health condition"
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                onPressEnter={() =>
                  customCondition.trim() && handleAddCustomCondition()
                }
                size="large"
                className="rounded-lg"
              />
              <Button
                type="primary"
                onClick={handleAddCustomCondition}
                disabled={!customCondition.trim()}
                size="large"
                style={{ backgroundColor: "#4285F4", borderColor: "#4285F4" }}
              >
                Add
              </Button>
            </Space.Compact>
          </div>

          {customConditions.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg animate-fadeIn">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Your custom health conditions:
              </h4>
              <div className="flex flex-wrap gap-2">
                {customConditions.map((condition) => (
                  <Tag
                    key={condition.condition_id}
                    closable
                    onClose={() => handleRemoveCustomCondition(condition)}
                    className="px-2 py-1 text-sm rounded-lg bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {condition.condition_name}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Modal>

        {/* Body Measurements Modal */}
        <Modal
          title={<span className="text-xl font-medium">Body Measurements</span>}
          open={isMeasureModalVisible}
          onOk={handleMeasureModalOk}
          onCancel={handleMeasureModalCancel}
          width={600}
          footer={null}
          centered
          styles={{ body: { padding: "24px" } }}
        >
          <p className="text-lg font-medium text-purple-900 mb-6">
            Enter your body measurements in centimeters
          </p>

          <Form
            name="bodyMeasurementsForm"
            layout="vertical"
            form={form}
            initialValues={{
              neck: userData.neckSize || "",
              shoulder: userData.shoulderSize || "",
              forearm: userData.forearmSize || "",
              biceps: userData.bicepsSize || "",
              hip: userData.hipSize || "",
              thigh: userData.thighSize || "",
              claves: userData.calvesSize || "",
            }}
            onFinish={updateBodyMeasurements}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item
                label={
                  <span className="text-base font-medium">Neck size (cm)</span>
                }
                name="neck"
                rules={[
                  { required: true, message: "Please enter your neck size!" },
                  {
                    validator: (_, value) => {
                      const num = Number(value);
                      if (isNaN(num) || num < 20 || num > 100) {
                        return Promise.reject(
                          "Please enter a valid measurement (20-100 cm)"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    fontSize: "16px",
                  }}
                  placeholder="Neck size"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-base font-medium">
                    Shoulder size (cm)
                  </span>
                }
                name="shoulder"
                rules={[
                  {
                    required: true,
                    message: "Please enter your shoulder size!",
                  },
                  {
                    validator: (_, value) => {
                      const num = Number(value);
                      if (isNaN(num) || num < 30 || num > 200) {
                        return Promise.reject(
                          "Please enter a valid measurement (30-200 cm)"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    fontSize: "16px",
                  }}
                  placeholder="Shoulder size"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-base font-medium">
                    Forearm size (cm)
                  </span>
                }
                name="forearm"
                rules={[
                  {
                    required: true,
                    message: "Please enter your forearm size!",
                  },
                  {
                    validator: (_, value) => {
                      const num = Number(value);
                      if (isNaN(num) || num < 15 || num > 100) {
                        return Promise.reject(
                          "Please enter a valid measurement (15-100 cm)"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    fontSize: "16px",
                  }}
                  placeholder="Forearm size"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-base font-medium">
                    Biceps size (cm)
                  </span>
                }
                name="biceps"
                rules={[
                  { required: true, message: "Please enter your biceps size!" },
                  {
                    validator: (_, value) => {
                      const num = Number(value);
                      if (isNaN(num) || num < 15 || num > 100) {
                        return Promise.reject(
                          "Please enter a valid measurement (15-100 cm)"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    fontSize: "16px",
                  }}
                  placeholder="Biceps size"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-base font-medium">Hip size (cm)</span>
                }
                name="hip"
                rules={[
                  { required: true, message: "Please enter your hip size!" },
                  {
                    validator: (_, value) => {
                      const num = Number(value);
                      if (isNaN(num) || num < 50 || num > 200) {
                        return Promise.reject(
                          "Please enter a valid measurement (50-200 cm)"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    fontSize: "16px",
                  }}
                  placeholder="Hip size"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-base font-medium">Thigh size (cm)</span>
                }
                name="thigh"
                rules={[
                  { required: true, message: "Please enter your thigh size!" },
                  {
                    validator: (_, value) => {
                      const num = Number(value);
                      if (isNaN(num) || num < 30 || num > 120) {
                        return Promise.reject(
                          "Please enter a valid measurement (30-120 cm)"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    fontSize: "16px",
                  }}
                  placeholder="Thigh size"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-base font-medium">
                    Calves size (cm)
                  </span>
                }
                name="claves"
                rules={[
                  { required: true, message: "Please enter your calves size!" },
                  {
                    validator: (_, value) => {
                      const num = Number(value);
                      if (isNaN(num) || num < 20 || num > 80) {
                        return Promise.reject(
                          "Please enter a valid measurement (20-80 cm)"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    fontSize: "16px",
                  }}
                  placeholder="Calves size"
                />
              </Form.Item>
            </div>

            <Form.Item className="mt-4">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  height: "50px",
                  fontSize: "16px",
                  fontWeight: "500",
                  borderRadius: "12px",
                  background: "linear-gradient(to right, #4f46e5, #6366f1)",
                  boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.5)",
                }}
                block
              >
                Save Measurements
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default Dashboard;
