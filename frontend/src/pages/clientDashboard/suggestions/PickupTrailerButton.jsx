import React, { useState } from "react";
import { FaTrailer } from "react-icons/fa";
import RentalModal from "./RentalModal";

const PickupTrailerButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="bg-pink-100 p-4 rounded-lg flex items-center justify-center gap-2 text-gray-800 hover:shadow-md transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <FaTrailer size={24} />
        <span className="text-sm font-medium">Pickup Trailer</span>
      </button>
      {isOpen && <RentalModal vehicleType="trailer" onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default PickupTrailerButton;