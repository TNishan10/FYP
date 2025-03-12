import React, { useState, useEffect } from "react";
import axios from "axios";
import SupplementsInfo from "../components/SupplementInfo/SupplementsInfo";
import { useNavigate } from "react-router-dom";

const Supplement = () => {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        // Get token from sessionStorage (or wherever you store it)
        const token = sessionStorage.getItem("token");

        if (!token) {
          setError("You must be logged in to view supplements");
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/api/v1/auth/supplement",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API Response:", response.data); // Debug log
        // Try to extract supplements data in various possible formats
        let supplementsData;

        if (Array.isArray(response.data)) {
          // If the API returns the array directly
          supplementsData = response.data;
        } else if (response.data && Array.isArray(response.data.supplements)) {
          // If the API returns {supplements: [...]}
          supplementsData = response.data.supplements;
        } else if (response.data && Array.isArray(response.data.data)) {
          // If the API returns {data: [...]}
          supplementsData = response.data.data;
        } else if (response.data && typeof response.data === "object") {
          // If it's a single object
          supplementsData = [response.data];
        } else {
          console.error("Could not parse supplements data:", response.data);
          setError("Could not retrieve supplements data");
          return;
        }

        // Debug the data
        if (supplementsData.length > 0) {
          console.log("First supplement item:", supplementsData[0]);
          const firstItem = supplementsData[0];
          console.log("Available properties:", Object.keys(firstItem));
          console.log(
            "Image URL value:",
            firstItem.supplement_image || firstItem.image || "Not found"
          );
        }

        console.log("Parsed supplements data:", supplementsData);
        setSupplements(supplementsData);
      } catch (err) {
        console.error("Error fetching supplements:", err);
        if (err.response && err.response.status === 401) {
          // Unauthorized - token expired or invalid
          navigate("/login");
        } else {
          setError("Failed to load supplements. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSupplements();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Supplements</h1>

      {supplements.length === 0 ? (
        <p className="text-center text-gray-500">No supplements found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {supplements.map((supplement) => {
            // Debug what's being passed
            console.log("Supplement data:", supplement);
            console.log("All supplement properties:", Object.keys(supplement));
            console.log("All supplement values:", Object.values(supplement));

            // Try different possible image field names
            const possibleImageFields = [
              "supplement_image",
              "image",
              "image_url",
              "url",
              "photo",
              "picture",
              "thumbnail",
            ];
            const foundImageField = possibleImageFields.find(
              (field) => supplement[field]
            );

            if (foundImageField) {
              console.log(
                `Found image in field '${foundImageField}': ${supplement[foundImageField]}`
              );
            } else {
              console.log("No image field found in:", supplement);
            }

            return (
              <SupplementsInfo
                key={supplement.supplement_id || supplement.id || Math.random()}
                id={supplement.supplement_id || supplement.id}
                title={
                  supplement.supplement_name ||
                  supplement.name ||
                  "Unknown Supplement"
                }
                url={
                  supplement.supplement_image ||
                  supplement.image ||
                  supplement.image_url ||
                  ""
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Supplement;
