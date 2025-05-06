import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaSun, FaMoon, FaCar, FaUser } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function History() {
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [passenger, setPassenger] = useState(null);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        toast.error('Please log in to view your ride history', {
          style: { background: '#F44336', color: 'white' },
        });
        navigate('/plogin');
        return;
      }

      setLoading(true);
      try {
        // Fetch passenger profile (optional)
        const profileResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (profileResponse.data.status) {
          setPassenger(profileResponse.data.data);
        }

        // Fetch ride history
        const historyResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/rides/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRideHistory(historyResponse.data.rides || []);
        toast.success('Ride history loaded successfully', {
          style: { background: '#4CAF50', color: 'white' },
        });
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'An error occurred';
        toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/plogin');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, token]);

  // Prevent rendering if rideHistory is not an array
  if (!Array.isArray(rideHistory)) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        No ride history data available.
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
      <header
        className={`flex items-center justify-between p-4 shadow-lg ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/ride')}
            className={`${
              theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-white'
            }`}
          >
            <FaArrowLeft size={24} />
          </button>
          <button
            onClick={toggleTheme}
            className={`${
              theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-white'
            }`}
          >
            {theme === 'light' ? <FaMoon size={24} /> : <FaSun size={24} />}
          </button>
        </div>
        <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
          Ride History
        </h2>
        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
          {passenger?.profilePicture && (
            <img
              src={passenger.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </header>

      <div className={`flex-1 p-6 ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
        {loading ? (
          <div
            className={`flex justify-center items-center h-full ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            <svg
              className="animate-spin h-8 w-8 mr-3"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              />
            </svg>
            <span>Loading ride history...</span>
          </div>
        ) : rideHistory.length > 0 ? (
          <div className="space-y-6">
            {rideHistory.map((ride) => (
              <div
                key={ride._id}
                className={`rounded-xl shadow-lg p-6 ${
                  theme === 'light' ? 'bg-white' : 'bg-gray-800'
                } transition-all duration-300 hover:shadow-xl`}
              >
                <h3
                  className={`text-lg font-semibold mb-3 ${
                    theme === 'light' ? 'text-gray-800' : 'text-white'
                  }`}
                >
                  Ride ID: {ride._id}
                </h3>
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-200'
                  }`}
                >
                  <div>
                    <p>
                      <span className="font-medium">Status:</span> {ride.status}
                    </p>
                    <p>
                      <span className="font-medium">Pickup:</span> {ride.pickupAddress}
                    </p>
                    <p>
                      <span className="font-medium">Destination:</span> {ride.destinationAddress}
                    </p>
                    <p>
                      <span className="font-medium">Distance:</span> {ride.distance} km
                    </p>
                    <p>
                      <span className="font-medium">Calculated Price:</span> ₦{ride.calculatedPrice}
                    </p>
                    {ride.desiredPrice && (
                      <p>
                        <span className="font-medium">Offered Price:</span> ₦{ride.desiredPrice}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Final Price:</span> ₦{ride.finalPrice || ride.desiredPrice || ride.calculatedPrice}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Ride Option:</span> {ride.rideOption}
                    </p>
                    <p>
                      <span className="font-medium">Payment Method:</span> {ride.paymentMethod}
                    </p>
                    <p>
                      <span className="font-medium">Created At:</span>{' '}
                      {new Date(ride.createdAt).toLocaleString()}
                    </p>
                    {ride.rating && (
                      <p>
                        <span className="font-medium">Rating:</span> {ride.rating}/5
                      </p>
                    )}
                    {ride.review && (
                      <p>
                        <span className="font-medium">Review:</span> {ride.review}
                      </p>
                    )}
                    {ride.rideDuration && (
                      <p>
                        <span className="font-medium">Duration:</span> {ride.rideDuration} min
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ride.client && (
                    <div
                      className={`p-4 rounded-lg ${
                        theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
                      }`}
                    >
                      <h4
                        className={`text-base font-semibold mb-3 flex items-center ${
                          theme === 'light' ? 'text-gray-800' : 'text-white'
                        }`}
                      >
                        <FaUser className="mr-2" /> Client Details
                      </h4>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Name:</span> {ride.client.firstName}{' '}
                          {ride.client.lastName}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {ride.client.email}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> {ride.client.phoneNumber}
                        </p>
                        {ride.client.profilePicture && (
                          <img
                            src={ride.client.profilePicture}
                            alt="Client"
                            className="w-12 h-12 rounded-full object-cover mt-2"
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {ride.driver && (
                    <div
                      className={`p-4 rounded-lg ${
                        theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
                      }`}
                    >
                      <h4
                        className={`text-base font-semibold mb-3 flex items-center ${
                          theme === 'light' ? 'text-gray-800' : 'text-white'
                        }`}
                      >
                        <FaCar className="mr-2" /> Driver Details
                      </h4>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Name:</span> {ride.driver.firstName}{' '}
                          {ride.driver.lastName}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {ride.driver.email}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> {ride.driver.phoneNumber}
                        </p>
                        <p>
                          <span className="font-medium">Car:</span> {ride.driver.carDetails.model} (
                          {ride.driver.carDetails.year})
                        </p>
                        <p>
                          <span className="font-medium">License Plate:</span>{' '}
                          {ride.driver.carDetails.plateNumber}
                        </p>
                        <p>
                          <span className="font-medium">Rating:</span> {ride.driver.rating}/5
                        </p>
                        <p>
                          <span className="font-medium">Ride Count:</span> {ride.driver.rideCount}
                        </p>
                        {ride.driver.profilePicture && (
                          <img
                            src={ride.driver.profilePicture}
                            alt="Driver"
                            className="w-12 h-12 rounded-full object-cover mt-2"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`flex justify-center items-center h-full ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            No ride history available.
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme={theme} />
    </div>
  );
}

export default History;