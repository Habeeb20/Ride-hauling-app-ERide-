import React from 'react';
import AirportPickupButton from './suggestions/AirportPickupButton';
import AirportDropOffButton from './suggestions/AirportDropOffButton';

const Airport = () => {
  return (
    <div className="min-h-screen  flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full space-y-6 transform transition-all hover:scale-105 duration-300">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Airport Rides</h2>
          <p className="mt-2 text-gray-500 text-sm">Book your airport pickup or drop-off with ease!</p>
        </div>

        {/* Buttons Container */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <AirportPickupButton />
          <AirportDropOffButton />
        </div>

        {/* Optional Call-to-Action */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">Reliable rides to and from the airport, 24/7.</p>
        </div>
      </div>
    </div>
  );
};

export default Airport;