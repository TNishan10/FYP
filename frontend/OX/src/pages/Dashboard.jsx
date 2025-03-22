import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
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
  Carousel,
  DatePicker,
  Card,
  Spin,
  InputNumber,
} from "antd";
import { toast } from "react-toastify";
import Chart from "../components/Charts/Chart.jsx";

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

  // Temp form values
  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMeasureModalVisible, setIsMeasureModalVisible] = useState(false);
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);

  // Carousel style
  const contentStyle = {
    height: "260px",
    color: "#fff",
    lineHeight: "260px",
    textAlign: "center",
  };

  // Fetch user data
  useEffect(() => {
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

  const handleModalCancel = () => setIsModalVisible(false);
  const handleMeasureModalCancel = () => setIsMeasureModalVisible(false);
  const handleDateModalCancel = () => setIsDateModalVisible(false);

  // Health condition handlers
  const handleHealthConditionChange = (values) => {
    setSelectedConditions(values);
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

  // Update height and weight
  const updateHeightWeight = async () => {
    if (!heightInput && !weightInput) {
      toast.error("Please enter height or weight to update");
      return;
    }

    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      const updateData = {};
      if (heightInput) updateData.height = heightInput;
      if (weightInput) updateData.weight = weightInput;

      // Update user info
      await axios.put(
        `http://localhost:8000/api/v1/auth/user-info/${userId}`,
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
      toast.error("Failed to update body metrics");
    } finally {
      setLoading(false);
    }
  };

  // Update user goal
  const handleGoalChange = async (e) => {
    const newGoal = e.target.value;

    try {
      const userId = localStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      await axios.put(
        `http://localhost:8000/api/v1/auth/user-info/${userId}`,
        { goal: newGoal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData((prev) => ({ ...prev, goal: newGoal }));
      toast.success("Fitness goal updated successfully");
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update fitness goal");
    }
  };

  // Update body measurements
  const updateBodyMeasurements = async (values) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

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
        `http://localhost:8000/api/v1/auth/user-info/${userId}`,
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
      toast.error("Failed to update body measurements");
    } finally {
      setLoading(false);
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (!heightInput || !weightInput) {
      toast.error("Please enter both height and weight");
      return;
    }

    const heightInMeters = heightInput / 100;
    const bmiValue = (weightInput / (heightInMeters * heightInMeters)).toFixed(
      1
    );
    setBMI(bmiValue);
  };

  // BMI interpretation content
  const bmiPopoverContent = (
    <div>
      {BMI <= 18.5 && (
        <p className="text-blue-700">
          Underweight. Consider starting a muscle building program.
        </p>
      )}
      {BMI > 18.5 && BMI <= 24.9 && (
        <p className="text-green-600">Normal Weight. Perfect!</p>
      )}
      {BMI > 25 && BMI < 29.9 && (
        <p className="text-orange-500">
          Overweight. Consider starting a weight loss program.
        </p>
      )}
      {BMI >= 30 && (
        <p className="text-red-600">
          Obesity. We suggest starting a fat loss program ASAP!
        </p>
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
    <div className="bg-gray-50">
      {isAdmin && (
        <div className="fixed bg-primaryButton p-1 px-4 rounded-xl z-10 bottom-0 right-0 m-3">
          <Link to="/admin" className="text-white">
            Admin panel
          </Link>
        </div>
      )}

      <Spin spinning={loading} tip="Loading your data...">
        <Modal
          title="Change your Date of birth"
          open={isDateModalVisible}
          onOk={handleDateModalOk}
          onCancel={handleDateModalCancel}
        >
          <DatePicker
            size="large"
            style={{ width: "100%", borderRadius: "15px" }}
            onChange={handleDateChange}
            format={dateFormat}
          />
        </Modal>

        {/* First section - Carousel */}
        <Carousel autoplay effect="fade">
          <div>
            <h3
              className="md:text-3xl bg-fixed bg-no-repeat bg-cover bg-top bg-[url('https://wallpaperaccess.com/full/2079529.jpg')] text-md tracking-widest"
              style={contentStyle}
            >
              ❝ DON'T WISH FOR IT, WORK FOR IT ❞
            </h3>
          </div>
          <div>
            <h3
              className="md:text-3xl bg-fixed bg-no-repeat bg-cover bg-top bg-[url('https://www.matchroomboxing.com/app/themes/matchroom/dist/images/preloader-24_2672c309.jpg')] text-md tracking-widest"
              style={contentStyle}
            >
              ❝ TRAIN INSANE OR REMAIN THE SAME ❞
            </h3>
          </div>
          <div>
            <h3
              className="md:text-3xl grayscale text-md bg-fixed bg-no-repeat bg-cover bg-center bg-[url('https://library.sportingnews.com/2021-08/khabib-nurmagomedov-cropped_1ldlgbf0wyd3u1eauhuzzkt3yp.jpg')] tracking-widest"
              style={contentStyle}
            >
              ❝ GO HARD or GO HOME ❞
            </h3>
          </div>
          <div>
            <h3
              className="md:text-3xl grayscale text-md bg-fixed bg-no-repeat bg-cover bg-[url('https://i.guim.co.uk/img/media/1914975a01a04898b32a2da113f4ab581399f776/0_32_2602_1562/master/2602..jpg?width=1200&height=630&quality=85&auto=format&fit=crop&overlay-align=bottom%2Cleft&overlay-width=100p&overlay-base64=L2ltZy9zdGF0aWMvb3ZlcmxheXMvdGctZGVmYXVsdC5wbmc&s=623b14a9df8c9f77148024b0b71c9c99')] bg-top tracking-widest"
              style={contentStyle}
            >
              ❝ TRUST YOURSELF AND CONQUER ❞
            </h3>
          </div>
        </Carousel>

        <h1 className="text-2xl mt-5 mb-0 px-4 text-center heading">
          Hello {userData.name} 👋
        </h1>

        <div className="mb-0">
          <h1 className="text-3xl tracking-widest text-gray-600 text-center mb-0 py-4 px-4 heading">
            ❛ Welcome to{" "}
            <span className="font-semibold text-primaryButton">
              GUARDIAN FITNESS{" "}
            </span>
            ❜
          </h1>
        </div>

        {/* User profile card */}
        <div className="md:flex md:flex-col md:pb-5 md:items-center">
          <Card className="h-fitcontent md:w-8/12 md:py-3 py-2 bg-navcolor rounded-3xl md:mt-11 shadow-lg">
            <h1 className="text-2xl mt-5 px-10 text-center">User Profile</h1>

            <div className="md:flex justify-center">
              <div className="py-6 tablet:flex hidden flex-shrink-0">
                <div className="w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center">
                  <img
                    src="/icons/User.svg"
                    alt="User"
                    className="w-48 h-48"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://cdn-icons-png.flaticon.com/512/1077/1077114.png";
                    }}
                  />
                </div>
              </div>

              <div className="py-6 md:py-10 px-10">
                <p className="text-lg items-center flex text-center md:text-left mb-4">
                  <img
                    className="px-4"
                    style={{ height: "30px" }}
                    src="https://cdn-icons-png.flaticon.com/512/1759/1759311.png"
                    alt="Name"
                  />
                  <span className="font-medium">Name:</span>
                  <span className="ml-2">{userData.name}</span>
                </p>

                <p className="text-lg items-center flex text-center md:text-left mb-4">
                  <img
                    className="px-4"
                    style={{ height: "30px" }}
                    src="https://cdn-icons-png.flaticon.com/512/6938/6938604.png"
                    alt="Date of birth"
                  />
                  <span className="font-medium">Date of birth:</span>
                  <span className="ml-2">
                    {userData.dob ? userData.dob.slice(0, 10) : "Not specified"}
                  </span>
                  <button
                    onClick={showDateModal}
                    className="ml-3 text-blue-500 hover:underline text-sm cursor-pointer"
                  >
                    Edit
                  </button>
                </p>

                <p className="text-lg items-center flex text-center md:text-left mb-4">
                  <img
                    className="px-4"
                    style={{ height: "30px" }}
                    src="https://cdn-icons.flaticon.com/png/128/3746/premium/3746552.png?token=exp=1646651311~hmac=022cda9eb744ac2545aaaed68df57b52"
                    alt="Weight"
                  />
                  <span className="font-medium">Weight:</span>
                  <span className="ml-2">{userData.weight} kg</span>
                </p>

                <p className="text-lg items-center flex text-center md:text-left mb-4">
                  <img
                    className="px-4"
                    style={{ height: "30px" }}
                    src="https://cdn-icons-png.flaticon.com/512/5559/5559879.png"
                    alt="Height"
                  />
                  <span className="font-medium">Height:</span>
                  <span className="ml-2">{userData.height} cm</span>
                </p>

                <Link to="/Notes">
                  <p className="text-lg items-center flex text-center md:text-left mb-4 cursor-pointer">
                    <img
                      className="px-4"
                      style={{ height: "30px" }}
                      src="https://cdn-icons.flaticon.com/png/512/3131/premium/3131619.png?token=exp=1646652052~hmac=f88c88b1c84bc9969de1af48de746c2f"
                      alt="Notes"
                    />
                    <span className="font-medium">Your Notes</span>
                    <span className="ml-2 text-blue-500">Check</span>
                  </p>
                </Link>

                <div className="hidden items-center md:flex md:text-lg md:text-left">
                  <img
                    className="px-4"
                    style={{ height: "30px" }}
                    src="https://cdn-icons-png.flaticon.com/512/752/752687.png"
                    alt="User ID"
                  />
                  <span className="font-medium">User ID:</span>
                  <Paragraph
                    style={{ fontSize: "15px", paddingTop: "13px" }}
                    copyable
                  >
                    {userData.userId}
                  </Paragraph>
                </div>
              </div>
            </div>

            <Divider className="border-solid">
              <span className="text-base leading-6 opacity-70 font-roboto">
                Edit Profile
              </span>
            </Divider>

            <div className="px-12">
              <div className="mb-6">
                <h1 className="text-xl mb-3">Change your plan</h1>
                <Radio.Group
                  name="radiogroup"
                  onChange={handleGoalChange}
                  value={userData.goal}
                >
                  <Radio value="Fat Loss">Lose Weight</Radio>
                  <Radio value="Get Fit">Get Fit</Radio>
                  <Radio value="Build Muscle">Build Muscle</Radio>
                </Radio.Group>
              </div>

              <div className="mb-6">
                <div className="md:flex md:pt-2 items-center">
                  <p className="mt-3 md:pr-4 text-lg">Weight:</p>
                  <div>
                    <Input
                      type="number"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      style={{
                        borderRadius: "10px",
                      }}
                      allowClear
                      placeholder="Weight/KGS"
                    />
                  </div>

                  <p className="mt-3 md:px-4 text-lg">Height:</p>
                  <div>
                    <Input
                      type="number"
                      value={heightInput}
                      onChange={(e) => setHeightInput(e.target.value)}
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      style={{
                        borderRadius: "10px",
                      }}
                      allowClear
                      placeholder="Height/cm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <Button
                  style={{
                    backgroundColor: "#607fe8",
                    borderRadius: "10px",
                    height: "45px",
                    boxShadow: "1px 1px grey",
                    border: "none",
                    padding: "0 20px",
                  }}
                  onClick={updateHeightWeight}
                  className="hover:opacity-90"
                >
                  <p className="text-lg text-white">Save Changes</p>
                </Button>

                <Button
                  style={{
                    backgroundColor: "#607fe8",
                    borderRadius: "10px",
                    height: "45px",
                    boxShadow: "1px 1px grey",
                    border: "none",
                    padding: "0 20px",
                  }}
                  onClick={showModal}
                  className="hover:opacity-90"
                >
                  <p className="text-lg text-white">Health Conditions</p>
                </Button>

                <Button
                  style={{
                    backgroundColor: "#607fe8",
                    borderRadius: "10px",
                    height: "45px",
                    boxShadow: "1px 1px grey",
                    border: "none",
                    padding: "0 20px",
                  }}
                  onClick={showMeasureModal}
                  className="hover:opacity-90"
                >
                  <p className="text-lg text-white">Body Measurements</p>
                </Button>
              </div>

              <div className="flex flex-wrap pt-3 flex-col">
                <button
                  className="text-center text-red-500 cursor-pointer hover:text-red-700"
                  onClick={deactivateAccount}
                >
                  Deactivate account
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Body metric section */}
        <div className="px-5 py-3 pb-6 bg-fixed bg-no-repeat bg-cover bg-top tablet:bg-[url('https://wallpaperaccess.com/full/2079529.jpg')]">
          <h1 className="text-3xl drop-shadow-2xl md:pt-6 tablet:text-white px-10 text-center">
            Body Metrics
          </h1>

          <div className="md:flex md:flex-col md:items-center">
            <Chart />
          </div>

          <div className="md:flex md:flex-col md:items-center">
            <Card className="h-fitcontent md:w-8/12 px-9 md:pb-6 md:bg-navcolor rounded-3xl drop-shadow-2xl md:mt-11">
              <h1 className="text-xl mt-5 px-1">Calculate BMI</h1>

              <div className="md:flex md:pt-2 items-center">
                <p className="mt-3 md:pr-4 text-lg">Weight:</p>
                <div>
                  <Input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    style={{
                      borderRadius: "10px",
                    }}
                    allowClear
                    placeholder="Weight/KGS"
                  />
                </div>

                <p className="mt-3 md:px-4 text-lg">Height:</p>
                <div>
                  <Input
                    type="number"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    style={{
                      borderRadius: "10px",
                    }}
                    allowClear
                    placeholder="Height/cm"
                  />
                </div>
              </div>

              <p className="mt-3 text-lg">
                BMI: {BMI}
                {BMI && (
                  <Popover content={bmiPopoverContent} title="BMI Information">
                    <Button type="primary" className="ml-3">
                      Tips
                    </Button>
                  </Popover>
                )}
              </p>

              <div className="flex flex-wrap justify-evenly mt-4">
                <Button
                  style={{
                    backgroundColor: "#607fe8",
                    borderRadius: "10px",
                    height: "50px",
                    width: "135px",
                    boxShadow: "1px 1px grey",
                    border: "none",
                  }}
                  onClick={showMeasureModal}
                  className="hover:opacity-90"
                >
                  <p className="text-lg text-white">Measurement</p>
                </Button>

                <Button
                  style={{
                    backgroundColor: "#607fe8",
                    borderRadius: "10px",
                    height: "50px",
                    width: "135px",
                    boxShadow: "1px 1px grey",
                    border: "none",
                  }}
                  onClick={calculateBMI}
                  className="hover:opacity-90"
                >
                  <p className="text-lg text-white">Calculate BMI</p>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Health Conditions Modal */}
        <Modal
          title="Select Health Conditions"
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
        >
          <p className="text-pink-900 text-xl mb-4">
            Please select all your health conditions:
          </p>
          <p className="text-sky-600 mb-4">
            If your health condition is not listed below please consult your
            trainer or doctor!
          </p>

          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select"
            value={selectedConditions}
            onChange={handleHealthConditionChange}
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
        </Modal>

        {/* Body Measurements Modal */}
        <Modal
          title="Body Measurements"
          open={isMeasureModalVisible}
          onOk={handleMeasureModalOk}
          onCancel={handleMeasureModalCancel}
          width={600}
          footer={null}
        >
          <p className="text-pink-900 text-lg mb-4">
            Please measure all muscles given below! Measure in centimeters
          </p>

          <Form
            name="bodyMeasurementsForm"
            layout="vertical"
            form={form}
            initialValues={{
              neck: userData.neckSize,
              shoulder: userData.shoulderSize,
              forearm: userData.forearmSize,
              biceps: userData.bicepsSize,
              hip: userData.hipSize,
              thigh: userData.thighSize,
              claves: userData.calvesSize,
            }}
            onFinish={updateBodyMeasurements}
          >
            <Form.Item
              label="Neck size (cm)"
              name="neck"
              rules={[
                { required: true, message: "Please enter your Neck Size!" },
              ]}
            >
              <Input
                type="number"
                size="middle"
                style={{
                  borderRadius: "10px",
                  fontSize: "17px",
                }}
                placeholder="Neck size"
              />
            </Form.Item>

            <Form.Item
              label="Shoulder size (cm)"
              name="shoulder"
              rules={[
                { required: true, message: "Please enter your Shoulder size!" },
              ]}
            >
              <Input
                type="number"
                size="middle"
                style={{
                  borderRadius: "10px",
                  fontSize: "17px",
                }}
                placeholder="Shoulder size"
              />
            </Form.Item>

            <Form.Item
              label="Forearm size (cm)"
              name="forearm"
              rules={[
                { required: true, message: "Please enter your Forearm size!" },
              ]}
            >
              <Input
                type="number"
                size="middle"
                style={{
                  borderRadius: "10px",
                  fontSize: "17px",
                }}
                placeholder="Forearm size"
              />
            </Form.Item>

            <Form.Item
              label="Biceps size (cm)"
              name="biceps"
              rules={[
                { required: true, message: "Please enter your Biceps size!" },
              ]}
            >
              <Input
                type="number"
                size="middle"
                style={{
                  borderRadius: "10px",
                  fontSize: "17px",
                }}
                placeholder="Biceps size"
              />
            </Form.Item>

            <Form.Item
              label="Hip size (cm)"
              name="hip"
              rules={[
                { required: true, message: "Please enter your Hip size!" },
              ]}
            >
              <Input
                type="number"
                size="middle"
                style={{
                  borderRadius: "10px",
                  fontSize: "17px",
                }}
                placeholder="Hip size"
              />
            </Form.Item>

            <Form.Item
              label="Thigh size (cm)"
              name="thigh"
              rules={[
                { required: true, message: "Please enter your Thigh size!" },
              ]}
            >
              <Input
                type="number"
                size="middle"
                style={{
                  borderRadius: "10px",
                  fontSize: "17px",
                }}
                placeholder="Thigh size"
              />
            </Form.Item>

            <Form.Item
              label="Calves size (cm)"
              name="claves"
              rules={[
                { required: true, message: "Please enter your Calves size!" },
              ]}
            >
              <Input
                type="number"
                size="middle"
                style={{
                  borderRadius: "10px",
                  fontSize: "17px",
                }}
                placeholder="Calves size"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="login"
                style={{
                  borderRadius: "15px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  boxShadow: "3px 3px rgba(0, 0, 0, 0.15)",
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
