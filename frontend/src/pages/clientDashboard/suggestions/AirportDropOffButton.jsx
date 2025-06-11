import React, { useState } from "react";
import { FaPlane } from "react-icons/fa";
import AirportModal from "./AirportModal";

const AirportDropOffButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="bg-gray-100 p-4 rounded-lg flex items-center justify-center gap-2 text-gray-800 hover:shadow-md transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <FaPlane size={24} />
        <span className="text-sm font-medium">Airport Drop Off</span>
      </button>
      {isOpen && <AirportModal mode="dropoff" onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default AirportDropOffButton;