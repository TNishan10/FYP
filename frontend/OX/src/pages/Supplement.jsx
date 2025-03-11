import React, { useState, useEffect } from "react";
import SupplementInfo from "../components/SupplementsInfo/index";
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
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:8000/api/v1/user/supplement",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include", // Include cookies if you're using them
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Supplements data:", data);
        setSupplements(data);
      } catch (err) {
        console.error("Failed to fetch supplements:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplements();
  }, [navigate]);

  if (loading) return <div>Loading supplements...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!supplements?.data?.length) return <div>No supplements found.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Supplement Information</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supplements?.data?.map((supplement) => (
          <SupplementInfo
            key={supplement?.supplement_id}
            id={supplement?.supplement_id}
            url={supplement?.image_url}
            title={supplement?.supplement_name}
          />
        ))}
      </div>
    </div>
  );
};

export default Supplement;
