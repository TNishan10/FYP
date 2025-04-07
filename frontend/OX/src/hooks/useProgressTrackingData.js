import { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import dayjs from "dayjs";

export const useProgressTrackingData = () => {
  const [userId, setUserId] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dailyFoods, setDailyFoods] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    const storedUserId =
      sessionStorage.getItem("userId") || localStorage.getItem("userId");

    if (!token || !storedUserId) {
      setAuthError(true);
      setIsLoading(false);
      return;
    }

    setUserId(storedUserId);
    fetchDailyFoods(storedUserId, selectedDate);
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (userId) {
      fetchDailyFoods(userId, date);
    }
  };

  const fetchDailyFoods = async (userId, date) => {
    if (!userId) {
      console.error("Cannot fetch foods without userId");
      return;
    }

    setIsLoading(true);
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        setAuthError(true);
        return;
      }

      // Format date for API
      const formattedDate = date.format("YYYY-MM-DD");

      const response = await axios.get(
        `http://localhost:8000/api/v1/auth/nutrition/daily-log/${userId}`,
        {
          params: { date: formattedDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        console.log("Daily foods fetched:", response.data.data);
        setDailyFoods(response.data.data);
      } else {
        message.error("Failed to load food data");
        setDailyFoods([]);
      }
    } catch (error) {
      console.error("Error fetching daily foods:", error);

      if (error.response?.status === 401) {
        setAuthError(true);
        message.error("Authentication required. Please log in again.");
      } else {
        message.error("Failed to load your food data");
        setDailyFoods([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    authError,
    userId,
    isLoading,
    selectedDate,
    dailyFoods,
    handleDateChange,
    fetchDailyFoods,
  };
};
