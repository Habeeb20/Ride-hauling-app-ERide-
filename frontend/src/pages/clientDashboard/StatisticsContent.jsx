import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaCar, FaChartBar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const StatisticsContent = ({ isDarkTheme }) => {
  const [profile, setProfile] = useState({});
  const [clicks, setClicks] = useState(0);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  // Fetch data using the provided useEffect
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const profileResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const profileData = profileResponse.data?.profile || {};
        setProfile(profileData);

        if (profileData.slug) {
          const clicksResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/profile/get-clicks/${profileData.slug}`
          );
          setClicks(clicksResponse.data.clicks || 0);
        }

        const bookingsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/ride/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookings(bookingsResponse.data.history || []);

        toast.success('You are welcome back', {
          style: { background: '#4CAF50', color: 'white' },
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('An error occurred while fetching dashboard data', {
          style: { background: '#F44', color: 'white' },
        });
        if (error.response?.status === 401 || error.response?.status === 404) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  // Calculate statistics based on bookings
  const totalBookings = bookings.length || 0;

  // Vehicle Type Distribution (assuming carDetails.vehicleType exists in bookings)
  const vehicleTypes = bookings.reduce((acc, booking) => {
    const vehicleType = booking.carDetails?.vehicleType || 'Unknown';
    acc[vehicleType] = (acc[vehicleType] || 0) + 1;
    return acc;
  }, {});

  const vehicleLabels = Object.keys(vehicleTypes);
  const vehicleDataValues = Object.values(vehicleTypes);
  const totalVehicles = vehicleDataValues.reduce((sum, val) => sum + val, 0);
  const vehiclePercentages = vehicleDataValues.map(val => totalVehicles > 0 ? Math.round((val / totalVehicles) * 100) : 0);

  const vehicleData = {
    labels: vehicleLabels.length > 0 ? vehicleLabels : ['Sedan', 'Crossover', 'Coupe', 'SUV'],
    datasets: [
      {
        data: vehicleDataValues.length > 0 ? vehicleDataValues : [30, 25, 20, 25],
        backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#111827'],
        borderWidth: 0,
      },
    ],
  };

  // Booking Status Breakdown
  const acceptedBookings = bookings.filter(booking => booking.status === 'accepted' || booking.status === 'in_progress').length;
  const canceledBookings = bookings.filter(booking => booking.status === 'canceled').length;
  const completedBookings = bookings.filter(booking => booking.status === 'completed').length;

  const totalStatuses = acceptedBookings + canceledBookings + completedBookings;
  const normalizedAcceptedPercentage = totalStatuses > 0 ? Math.round((acceptedBookings / totalStatuses) * 100) : 0;
  const normalizedCanceledPercentage = totalStatuses > 0 ? Math.round((canceledBookings / totalStatuses) * 100) : 0;
  const normalizedCompletedPercentage = totalStatuses > 0 ? Math.round((completedBookings / totalStatuses) * 100) : 0;

  const bookingStatusData = {
    labels: ['Accepted', 'Canceled', 'Completed'],
    datasets: [
      {
        data: [
          normalizedAcceptedPercentage,
          normalizedCanceledPercentage,
          normalizedCompletedPercentage,
        ],
        backgroundColor: ['#4A90E2', '#FF6B6B', '#50C878'],
        borderWidth: 0,
      },
    ],
  };

  // Total Bookings Percentage (relative to a max of 100)
  const maxBookings = 100;
  const bookingsPercentage = totalBookings > 0 ? Math.round((totalBookings / maxBookings) * 100) : 0;

  const bookingsData = {
    labels: ['Bookings'],
    datasets: [
      {
        data: [bookingsPercentage, 100 - bookingsPercentage],
        backgroundColor: ['#4A90E2', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  // Total Clicks Percentage (relative to a max of 1000)
  const maxClicks = 1000;
  const clicksPercentage = clicks > 0 ? Math.round((clicks / maxClicks) * 100) : 0;

  const clicksData = {
    labels: ['Clicks'],
    datasets: [
      {
        data: [clicksPercentage, 100 - clicksPercentage],
        backgroundColor: ['#4A90E2', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className={`p-6 lg:p-8 ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6">Statistics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className={`p-6 rounded-xl shadow-md flex items-center ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="p-4 bg-blue-100 rounded-lg mr-4">
            <FaCar className="text-blue-600 text-2xl" />
          </div>
          <div>
            <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>Total Bookings</p>
            <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{totalBookings}</p>
          </div>
        </div>
        <div className={`p-6 rounded-xl shadow-md flex items-center ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="p-4 bg-green-100 rounded-lg mr-4">
            <FaCheckCircle className="text-green-600 text-2xl" />
          </div>
          <div>
            <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>Completed Bookings</p>
            <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{completedBookings}</p>
          </div>
        </div>
        <div className={`p-6 rounded-xl shadow-md flex items-center ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="p-4 bg-red-100 rounded-lg mr-4">
            <FaChartBar className="text-red-600 text-2xl" />
          </div>
          <div>
            <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>Total Clicks</p>
            <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{clicks}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Bookings and Clicks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Total Bookings</p>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{totalBookings}</p>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>{bookingsPercentage}%</p>
              <div className="mt-4 w-16 h-16">
                <Doughnut
                  data={bookingsData}
                  options={{
                    cutout: '70%',
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
            <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Total Clicks</p>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{clicks}</p>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>{clicksPercentage}%</p>
              <div className="mt-4 w-16 h-16">
                <Doughnut
                  data={clicksData}
                  options={{
                    cutout: '70%',
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Vehicle Types and Booking Status */}
        <div className="space-y-6">
          <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-800'} mb-4`}>Vehicle Type Distribution</h3>
            <div className="relative w-40 h-40 mx-auto">
              <Doughnut
                data={vehicleData}
                options={{
                  cutout: '70%',
                  plugins: { legend: { display: false } },
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                  {vehiclePercentages[0] || 0}%
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {vehicleData.labels.map((label, index) => (
                <div key={label} className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: vehicleData.datasets[0].backgroundColor[index] }}
                  ></div>
                  <span className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                    {label}: {vehiclePercentages[index] || 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-800'} mb-4`}>Booking Status Breakdown</h3>
            <div className="relative w-40 h-40 mx-auto">
              <Doughnut
                data={bookingStatusData}
                options={{
                  cutout: '70%',
                  plugins: { legend: { display: false } },
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                  {normalizedAcceptedPercentage}%
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  Accepted: {normalizedAcceptedPercentage}%
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  Canceled: {normalizedCanceledPercentage}%
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  Completed: {normalizedCompletedPercentage}%
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default StatisticsContent;