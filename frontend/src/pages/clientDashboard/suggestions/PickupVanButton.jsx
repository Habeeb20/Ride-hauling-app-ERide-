import React, { useState } from "react";
import { FaTruck } from "react-icons/fa";
import RentalModal from "./RentalModal";

const PickupVanButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="bg-green-100 p-4 rounded-lg flex items-center justify-center gap-2 text-gray-800 hover:shadow-md transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <FaTruck size={24} />
        <span className="text-sm font-medium">Pickup Van</span>
      </button>
      {isOpen && <RentalModal vehicleType="van" onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default PickupVanButton;