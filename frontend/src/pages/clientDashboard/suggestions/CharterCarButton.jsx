import React, { useState } from "react";
import { FaCar } from "react-icons/fa";
import BookingModal from "./BookingModal";

const CharterCarButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="bg-pink-100 p-4 rounded-lg flex items-center justify-center gap-2 text-gray-800 hover:shadow-md transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <FaCar size={24} />
        <span className="text-sm font-medium">Charter a Car</span>
      </button>
      {isOpen && <BookingModal vehicleType="car" onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default CharterCarButton;