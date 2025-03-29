import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { notification } from "antd";

const API_URL = "http://localhost:8000/api/v1/auth";

const useProgressTrackingData = (initialDate = dayjs()) => {
  const [authError, setAuthError] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [dailyFoods, setDailyFoods] = useState([]);

  // Effect to check authentication and load initial data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const storedUserId = localStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        console.log("Auth check:", { userId: storedUserId, hasToken: !!token });

        if (!storedUserId || !token) {
          setLoading(false);
          setAuthError(true);
          return;
        }

        setUserId(storedUserId);
        await fetchDailyFoods(storedUserId, selectedDate);
        setLoading(false);
      } catch (error) {
        console.error("Error loading progress tracking data:", error);
        notification.error({
          message: "Failed to load data",
          description: "There was a problem loading your progress data.",
        });
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch daily foods when date changes
  useEffect(() => {
    if (userId) {
      fetchDailyFoods(userId, selectedDate);
    }
  }, [selectedDate, userId]);

  // Fetch food data for the selected date
  const fetchDailyFoods = async (userId, date) => {
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const token = sessionStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/nutrition/daily-log/${userId}`,
        {
          params: { date: formattedDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setDailyFoods(response.data.data.foods || []);
        return response.data.data.foods || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching daily foods:", error);
      setDailyFoods([]);
      return [];
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return {
    authError,
    userId,
    loading,
    selectedDate,
    dailyFoods,
    handleDateChange,
    fetchDailyFoods,
  };
};

export default useProgressTrackingData;
