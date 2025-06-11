import React, { useState } from "react";
import { FaBus } from "react-icons/fa";
import BookingModal from "./BookingModal";

const BusTravelButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="bg-yellow-100 p-4 rounded-lg flex items-center justify-center gap-2 text-gray-800 hover:shadow-md transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <FaBus size={24} />
        <span className="text-sm font-medium">Bus Travel</span>
      </button>
      {isOpen && <BookingModal vehicleType="bus" onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default BusTravelButton;