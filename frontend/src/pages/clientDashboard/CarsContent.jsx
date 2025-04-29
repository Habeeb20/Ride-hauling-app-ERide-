import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';

const DriversContent = ({ isDarkTheme }) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null); // State for the details modal
  const [selectedImage, setSelectedImage] = useState(null); // State for the image modal
  const [stateFilter, setStateFilter] = useState(''); // State filter
  const [lgaFilter, setLgaFilter] = useState(''); // LGA filter
  const [states, setStates] = useState([]); // Available states for filtering
  const [lgas, setLgas] = useState([]); // Available LGAs for the selected state

  // Fetch drivers from the backend with filters
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const params = {};
        if (stateFilter) params.state = stateFilter;
        if (lgaFilter) params.lga = lgaFilter;

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/drivers`, { params });
        if (response.data.status) {
          const fetchedDrivers = response.data.data || [];
          setDrivers(fetchedDrivers);

          // Extract unique states for the filter dropdown
          const uniqueStates = [...new Set(fetchedDrivers.map(driver => driver.location.state))].sort();
          setStates(uniqueStates);

          // Extract LGAs for the selected state
          if (stateFilter) {
            const filteredLgas = [...new Set(fetchedDrivers
              .filter(driver => driver.location.state === stateFilter)
              .map(driver => driver.location.lga)
            )].sort();
            setLgas(filteredLgas);
          } else {
            const allLgas = [...new Set(fetchedDrivers.map(driver => driver.location.lga))].sort();
            setLgas(allLgas);
          }
        } else {
          console.error('Failed to fetch drivers:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };

    fetchDrivers();
  }, [stateFilter, lgaFilter]);

  // Open the details modal with the selected driver's details
  const openDetailsModal = (driver) => {
    setSelectedDriver(driver);
  };

  // Close the details modal
  const closeDetailsModal = () => {
    setSelectedDriver(null);
  };

  // Open the image modal with the selected image
  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  // Close the image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Placeholder function for booking a driver
  const handleBook = (driver) => {
    console.log(`Booking driver: ${driver.userId.firstName} ${driver.userId.lastName}`);
    alert(`Booking request sent for ${driver.userId.firstName} ${driver.userId.lastName}`);
  };

  return (
    <div>
      {/* Filter Section */}
      <div className={`p-4 rounded-lg mb-4 ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        <h2 className="text-xl font-bold mb-4">Filter Drivers</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">State</label>
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setLgaFilter(''); // Reset LGA filter when state changes
              }}
              className={`w-full border rounded py-2 px-3 text-sm focus:outline-none focus:ring-2 ${
                isDarkTheme
                  ? 'bg-gray-800 text-white border-gray-600 focus:ring-gray-500'
                  : 'bg-white text-gray-800 border-gray-300 focus:ring-customGreen'
              }`}
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">LGA</label>
            <select
              value={lgaFilter}
              onChange={(e) => setLgaFilter(e.target.value)}
              className={`w-full border rounded py-2 px-3 text-sm focus:outline-none focus:ring-2 ${
                isDarkTheme
                  ? 'bg-gray-800 text-white border-gray-600 focus:ring-gray-500'
                  : 'bg-white text-gray-800 border-gray-300 focus:ring-customGreen'
              }`}
              disabled={!stateFilter && lgas.length === 0}
            >
              <option value="">All LGAs</option>
              {lgas.map((lga) => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.length === 0 ? (
          <p className={`text-center ${isDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>
            No drivers found.
          </p>
        ) : (
          drivers.map((driver) => (
            <div
              key={driver.userId._id}
              className={`p-4 rounded-lg shadow hover:shadow-lg transition ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
            >
              {/* Images Section */}
              <div className="flex items-center space-x-4 mb-2">
                {/* Driver Profile Picture */}
                <div className="relative">
                  <img
                    src={driver.profilePicture || 'https://via.placeholder.com/80?text=Driver+Image'}
                    alt={`${driver.userId.firstName} ${driver.userId.lastName}`}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                  <button
                    onClick={() => openImageModal(driver.profilePicture || 'https://via.placeholder.com/80?text=Driver+Image')}
                    className={`absolute top-0 right-0 p-1 rounded-full ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} opacity-75 hover:opacity-100`}
                  >
                    <FaEye />
                  </button>
                </div>
                {/* Car Picture */}
                <div className="relative">
                  <img
                    src={driver.carPicture || 'https://via.placeholder.com/80?text=Car+Image'}
                    alt={`${driver.userId.firstName}'s Car`}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                  <button
                    onClick={() => openImageModal(driver.carPicture || 'https://via.placeholder.com/80?text=Car+Image')}
                    className={`absolute top-0 right-0 p-1 rounded-full ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} opacity-75 hover:opacity-100`}
                  >
                    <FaEye />
                  </button>
                </div>
              </div>

              {/* Driver Name */}
              <h3 className="text-lg font-semibold">
                {driver.userId.firstName} {driver.userId.lastName}
              </h3>

              {/* Basic Details */}
              <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                {driver.gender}, {driver.phoneNumber}, {driver.location.lga}, {driver.location.state}
              </p>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm">
                  Verification:{' '}
                  <span
                    className={
                      driver.userId.verificationStatus === 'verified'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    {driver.userId.verificationStatus}
                  </span>
                </p>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm ml-1">{driver.rating || 0}</span>
                </div>
              </div>

              {/* Car Details */}
              {driver.carDetails && (
                <div className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                  <p><strong>Car:</strong> {driver.carDetails.model} {driver.carDetails.product}</p>
                  <p><strong>Year:</strong> {driver.carDetails.year}</p>
                  <p><strong>Color:</strong> {driver.carDetails.color}</p>
                  <p><strong>Plate Number:</strong> {driver.carDetails.plateNumber}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => openDetailsModal(driver)}
                  className={`flex-1 text-white py-2 rounded ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-customGreen hover:bg-opacity-80'} text-sm`}
                >
                  View More
                </button>
                <button
                  onClick={() => handleBook(driver)}
                  className={`flex-1 text-white py-2 rounded ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-customGreen hover:bg-opacity-80'} text-sm`}
                >
                  Book
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for More Details */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg rounded-lg p-6 max-h-[90vh] overflow-y-auto ${
              isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {selectedDriver.userId.firstName} {selectedDriver.userId.lastName}
              </h3>
              <button
                onClick={closeDetailsModal}
                className={`text-2xl ${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm"><strong>Email:</strong> {selectedDriver.userId.email}</p>
              <p className="text-sm"><strong>Unique Number:</strong> {selectedDriver.userId.uniqueNumber}</p>
              <p className="text-sm"><strong>Phone Number:</strong> {selectedDriver.phoneNumber}</p>
              <p className="text-sm"><strong>Clicks:</strong> {selectedDriver.clickCount || 0}</p>
              <p className="text-sm"><strong>Completed Rides:</strong> {selectedDriver.completedRideCount || 0}</p>
              <p className="text-sm"><strong>Rejected Rides:</strong> {selectedDriver.rejectedRideCount || 0}</p>
              <p className="text-sm"><strong>Total Income:</strong> ${selectedDriver.totalIncome?.toLocaleString() || 0}</p>
              <p className="text-sm"><strong>Platform Fee:</strong> ${selectedDriver.platFormFee?.toLocaleString() || 0}</p>
              <p className="text-sm"><strong>Income After Fee:</strong> ${selectedDriver.incomeAfterFee?.toLocaleString() || 0}</p>
              <p className="text-sm"><strong>Available:</strong> {selectedDriver.available ? 'Yes' : 'No'}</p>
              <p className="text-sm"><strong>Rating:</strong> {selectedDriver.rating || 0}</p>
              <p className="text-sm"><strong>Ride Count:</strong> {selectedDriver.rideCount || 0}</p>
              {selectedDriver.carDetails && (
                <>
                  <p className="text-sm"><strong>Car Model:</strong> {selectedDriver.carDetails.model}</p>
                  <p className="text-sm"><strong>Car Product:</strong> {selectedDriver.carDetails.product}</p>
                  <p className="text-sm"><strong>Car Year:</strong> {selectedDriver.carDetails.year}</p>
                  <p className="text-sm"><strong>Car Color:</strong> {selectedDriver.carDetails.color}</p>
                  <p className="text-sm"><strong>Plate Number:</strong> {selectedDriver.carDetails.plateNumber}</p>
                  <p className="text-sm">
                    <strong>Car Picture:</strong>
                    <button
                      onClick={() => openImageModal(selectedDriver.carPicture || 'https://via.placeholder.com/80?text=Car+Image')}
                      className={`ml-2 rounded-full ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} opacity-75 hover:opacity-100`}
                    >
                      <FaEye />
                    </button>
                  </p>
                </>
              )}
              <p className="text-sm"><strong>Comments:</strong></p>
              <ul className="list-disc pl-5 text-sm">
                {selectedDriver.comments && selectedDriver.comments.length > 0 ? (
                  selectedDriver.comments.map((comment, index) => (
                    <li key={index}>{comment.text} - {new Date(comment.createdAt).toLocaleDateString()}</li>
                  ))
                ) : (
                  <li>No comments available.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Viewing Images */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Large View"
              className="max-w-full max-h-[90vh] rounded-lg"
            />
            <button
              onClick={closeImageModal}
              className={`absolute top-2 right-2 p-2 rounded-full text-2xl ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversContent;