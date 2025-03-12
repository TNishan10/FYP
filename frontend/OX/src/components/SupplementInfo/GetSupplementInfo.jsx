import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const GetSupplementInfo = ({ supplementId, isModal = false, onClose }) => {
  const [supplement, setSupplement] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  // Use either the provided supplementId (for modal) or the URL param (for full page)
  const id = supplementId || urlId;

  useEffect(() => {
    const fetchSupplementData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");

        if (!token) {
          setError("You must be logged in to view supplement details");
          return;
        }

        const response = await axios.get(
          `http://localhost:8000/api/v1/auth/supplement/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Supplement data:", response.data);

        if (response.data && response.data.data) {
          setSupplement(response.data.data);
        } else {
          setError("Supplement not found");
        }
      } catch (err) {
        console.error("Error fetching supplement details:", err);
        setError("Failed to load supplement details");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplementData();
  }, [id]);

  const handleGoBack = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate("/supplements");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 text-lg mb-2">{error}</p>
        <button
          className="bg-black text-white py-1 px-3 rounded hover:bg-gray-800"
          onClick={handleGoBack}
        >
          {isModal ? "Close" : "Back to Supplements"}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${
        isModal ? "max-h-[70vh] overflow-y-auto" : "container mx-auto px-4 py-8"
      }`}
    >
      {isModal ? (
        <div className="flex flex-col bg-gray-50 p-3 rounded-lg">
          <h1 className="text-xl font-bold mb-2 text-center text-blue-800">
            {supplement.supplement_name}
          </h1>

          <div className="flex space-x-4">
            {/* Smaller Image */}
            <img
              className="rounded-lg object-cover h-[120px] w-[120px] border-2 border-gray-200 shadow-sm"
              src={supplement.image_url}
              alt={supplement.supplement_name}
            />

            {/* Key Info */}
            <div className="flex-1 bg-blue-50 p-2 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold text-blue-700">Company:</span>{" "}
                <span className="text-blue-600"> {supplement.company} </span>
              </p>
              <p className="text-sm mt-1">
                <span className="font-semibold text-blue-700">
                  Description:
                </span>{" "}
                <span className="text-blue-600">
                  {supplement.description?.substring(0, 100)}
                  {supplement.description?.length > 100 ? "..." : ""}
                </span>
              </p>
            </div>
          </div>

          {/* Nutrition Info */}
          <div className="mt-3 pt-2 border-t border-gray-200">
            <h2 className="text-sm font-bold mb-2 text-blue-800">
              Nutrition Information
            </h2>
            <div className="grid grid-cols-4 gap-1 text-center text-xs">
              <div className="bg-blue-100 p-1 rounded shadow-sm">
                <p className="font-semibold text-blue-800">Energy</p>
                <p className="text-gray-800">{supplement.energy}</p>
              </div>
              <div className="bg-green-100 p-1 rounded shadow-sm">
                <p className="font-semibold text-green-800">Protein</p>
                <p className="text-gray-800">{supplement.protein}</p>
              </div>
              <div className="bg-yellow-100 p-1 rounded shadow-sm">
                <p className="font-semibold text-yellow-800">Carbs</p>
                <p className="text-gray-800">{supplement.carbs}</p>
              </div>
              <div className="bg-red-100 p-1 rounded shadow-sm">
                <p className="font-semibold text-red-800">Fat</p>
                <p className="text-gray-800">{supplement.fat}</p>
              </div>
            </div>
          </div>

          {/* Tips (collapsible) */}
          <div className="mt-2 text-sm bg-green-50 p-2 rounded-lg">
            <p className="font-semibold text-green-700">Tips:</p>
            <p className="text-xs text-gray-800">
              {supplement.tips?.substring(0, 100)}
              {supplement.tips?.length > 100 ? "..." : ""}
            </p>
          </div>

          {/* Modal Close Button */}
          <div className="flex justify-center mt-3">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white py-1 px-4 rounded-xl hover:bg-blue-700 text-sm shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        /* Original full-page layout */
        <div>
          <div className="flex flex-col items-center">
            {/* Image Section */}
            <div className="flex px-5 mt-5 rounded-3xl flex-col align-middle bg-gray-50 shadow-md">
              <div className="flex my-3 justify-center">
                <img
                  className="rounded-lg object-contain border-2 border-gray-200"
                  src={supplement.image_url}
                  alt={supplement.supplement_name}
                  height="300"
                  width="300"
                />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:flex md:flex-col my-4 md:pb-5 md:items-center">
            <div className="md:w-full md:py-3 py-2 bg-blue-50 rounded-3xl shadow-lg">
              <h1 className="text-2xl font-bold mt-3 px-10 text-center text-blue-800">
                Supplement Profile
              </h1>

              <div className="py-6 md:py-5 px-10">
                <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-lg font-semibold text-blue-700">
                    Supplement name:{" "}
                    <span className="font-normal text-gray-800">
                      {supplement.supplement_name}
                    </span>
                  </p>
                </div>

                <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-lg font-semibold text-blue-700">
                    Company:{" "}
                    <span className="font-normal text-gray-800">
                      {supplement.company}
                    </span>
                  </p>
                </div>

                <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-lg font-semibold text-blue-700">
                    Description:
                  </p>
                  <p className="text-lg ml-4 text-gray-800">
                    {supplement.description}
                  </p>
                </div>

                <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-lg font-semibold text-green-700">Tips:</p>
                  <p className="text-lg ml-4 text-gray-800">
                    {supplement.tips}
                  </p>
                </div>

                {/* Nutrition Info */}
                <div className="mt-8 border-t border-gray-300 pt-6">
                  <h2 className="text-xl font-bold mb-4 text-blue-800">
                    Nutrition Information
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                      <p className="font-semibold text-blue-800">Energy</p>
                      <p className="text-gray-800">{supplement.energy}</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg shadow-md">
                      <p className="font-semibold text-green-800">Protein</p>
                      <p className="text-gray-800">{supplement.protein}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
                      <p className="font-semibold text-yellow-800">Carbs</p>
                      <p className="text-gray-800">{supplement.carbs}</p>
                    </div>
                    <div className="bg-red-100 p-4 rounded-lg shadow-md">
                      <p className="font-semibold text-red-800">Fat</p>
                      <p className="text-gray-800">{supplement.fat}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="fixed bg-blue-600 p-3 z-10 px-6 rounded-xl bottom-0 right-0 m-5 shadow-lg">
            <button onClick={handleGoBack} className="text-white">
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetSupplementInfo;
