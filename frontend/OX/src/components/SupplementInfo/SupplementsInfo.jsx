import React, { useState } from "react";
import GetSupplementInfo from "./GetSupplementInfo";

const SupplementsInfo = ({ url, title, id }) => {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplementId, setSelectedSupplementId] = useState(null);

  const formatUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300x300?text=No+Image";

    // If URL doesn't start with http or https, assume it's a relative path
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `http://localhost:8000${url.startsWith("/") ? "" : "/"}${url}`;
    }

    return url;
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${url}`);
    setImageError(true);
  };

  console.log(`Rendering image with URL: ${url}`);

  const handleGetInfoClick = (e) => {
    e.preventDefault();
    setSelectedSupplementId(id);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplementId(null);
  };

  return (
    <div>
      <div className="flex mt-5 rounded-3xl drop-shadow-2xl flex-col w-80 md:w-96 align-middle bg-white">
        <div className="flex my-3 justify-center">
          <img
            className="rounded-xl object-cover h-[300px] w-[300px]"
            src={
              imageError
                ? "https://via.placeholder.com/300x300?text=No+Image"
                : formatUrl(url)
            }
            alt={title}
            onError={handleImageError}
          />
        </div>
        <div className="px-4 py-3">
          <p className="text-black text-lg md:text-lg text-center font-semibold">
            {title}{" "}
            <a
              href="#"
              onClick={handleGetInfoClick}
              className="text-blue-600 hover:underline ml-1"
            >
              Get Info
            </a>
          </p>
        </div>
      </div>

      {/* Render the modal if isModalOpen is true */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-80 md:w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            <GetSupplementInfo
              supplementId={selectedSupplementId}
              isModal={true}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplementsInfo;
