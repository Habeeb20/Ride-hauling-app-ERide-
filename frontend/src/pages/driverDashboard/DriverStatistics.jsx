import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaHistory, FaTruck, FaLightbulb } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const DriverStatistics = ({ isDarkTheme }) => {
  const [profile, setProfile] = useState({});
  const [clicks, setClicks] = useState(0);
  const [driverStats, setDriverStats] = useState({
    totalRides: 0,
    completedRides: 0,
    rejectedRides: 0,
    cancelledRides: 0,
    totalEarnings: 0,
    income: 0,
  });
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Fetch profile data
        const profileResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const profileData = profileResponse.data?.profile || {};
        setProfile(profileData);

        // Fetch clicks
        if (profileData.slug) {
          const clicksResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/profile/get-clicks/${profileData.slug}`
          );
          setClicks(clicksResponse.data.clicks || 0);
        }

        // Fetch driver statistics
        const statsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/ride/driver/${profileData.userId}/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const statsData = statsResponse.data.stats || {};

        // Fetch ride history to count cancelled rides
        const historyResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/ride/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const cancelledRides = historyResponse.data.history?.filter(
          (ride) => ride.status === 'cancelled'
        ).length || 0;

        // Calculate income (assuming 20% platform fee)
        const totalEarnings = statsData.totalEarnings || 0;
        const income = totalEarnings * 0.8;

        setDriverStats({
          totalRides: statsData.totalRides || 0,
          completedRides: statsData.completedRides || 0,
          rejectedRides: statsData.rejectedRides || 0,
          cancelledRides,
          totalEarnings,
          income,
        });

        toast.success('Welcome to your driver dashboard', {
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

  // Chart data for statistics
  const maxRides = 100;
  const maxEarnings = 100000; // NGN

  const totalRidesData = {
    labels: ['Total Rides'],
    datasets: [
      {
        data: [
          driverStats.totalRides > 0 ? Math.round((driverStats.totalRides / maxRides) * 100) : 0,
          100 - (driverStats.totalRides > 0 ? Math.round((driverStats.totalRides / maxRides) * 100) : 0),
        ],
        backgroundColor: ['#4A90E2', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  const completedRidesData = {
    labels: ['Completed Rides'],
    datasets: [
      {
        data: [
          driverStats.completedRides > 0 ? Math.round((driverStats.completedRides / maxRides) * 100) : 0,
          100 - (driverStats.completedRides > 0 ? Math.round((driverStats.completedRides / maxRides) * 100) : 0),
        ],
        backgroundColor: ['#50C878', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  const rejectedRidesData = {
    labels: ['Rejected Rides'],
    datasets: [
      {
        data: [
          driverStats.rejectedRides > 0 ? Math.round((driverStats.rejectedRides / maxRides) * 100) : 0,
          100 - (driverStats.rejectedRides > 0 ? Math.round((driverStats.rejectedRides / maxRides) * 100) : 0),
        ],
        backgroundColor: ['#FF6B6B', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  const cancelledRidesData = {
    labels: ['Cancelled Rides'],
    datasets: [
      {
        data: [
          driverStats.cancelledRides > 0 ? Math.round((driverStats.cancelledRides / maxRides) * 100) : 0,
          100 - (driverStats.cancelledRides > 0 ? Math.round((driverStats.cancelledRides / maxRides) * 100) : 0),
        ],
        backgroundColor: ['#FBBF24', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  const totalEarningsData = {
    labels: ['Total Earnings'],
    datasets: [
      {
        data: [
          driverStats.totalEarnings > 0 ? Math.round((driverStats.totalEarnings / maxEarnings) * 100) : 0,
          100 - (driverStats.totalEarnings > 0 ? Math.round((driverStats.totalEarnings / maxEarnings) * 100) : 0),
        ],
        backgroundColor: ['#8B5CF6', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  const incomeData = {
    labels: ['Income'],
    datasets: [
      {
        data: [
          driverStats.income > 0 ? Math.round((driverStats.income / maxEarnings) * 100) : 0,
          100 - (driverStats.income > 0 ? Math.round((driverStats.income / maxEarnings) * 100) : 0),
        ],
        backgroundColor: ['#10B981', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  // Total Clicks Percentage (unchanged)
  const maxClicks = 1000;
  const clicksPercentage = clicks > 0 ? Math.round((clicks / maxClicks) * 100) : 0;

  const clicksData = {
    labels: ['Profile Views'],
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
      <h2 className="text-2xl font-bold mb-6">Driver Statistics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className={`p-6 rounded-xl shadow-md flex items-center ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="p-4 bg-blue-100 rounded-lg mr-4">
            <FaHistory className="text-blue-600 text-2xl" role="img" aria-label="Ride History" />
          </div>
          <div>
            <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>Total Rides</p>
            <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{driverStats.totalRides}</p>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {driverStats.totalRides > 0 ? Math.round((driverStats.totalRides / maxRides) * 100) : 0}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut
                  data={totalRidesData}
                  options={{
                    cutout: '70%',
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
          </div>
        </div>
        <div className={`p-6 rounded-xl shadow-md flex items-center ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="p-4 bg-green-100 rounded-lg mr-4">
            <FaTruck className="text-green-600 text-2xl" role="img" aria-label="Completed Pickups" />
          </div>
          <div>
          <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Completed Rides</p>
                <p className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{driverStats.completedRides}</p>
                <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  {driverStats.completedRides > 0 ? Math.round((driverStats.completedRides / maxRides) * 100) : 0}%
                </p>
                <div className="mt-2 w-16 h-16 mx-auto">
                  <Doughnut
                    data={completedRidesData}
                    options={{
                      cutout: '70%',
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
          </div>
        </div>
        <div className={`p-6 rounded-xl shadow-md flex items-center ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="p-4 bg-purple-100 rounded-lg mr-4">
            <FaLightbulb className="text-purple-600 text-2xl" role="img" aria-label="Total Earnings" />
          </div>
          <div>
            <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>Total Earnings</p>
            <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>NGN {driverStats.totalEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>









      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Rides and Profile Views */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
              
            <div>
                <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Cancelled Rides</p>
                <p className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{driverStats.cancelledRides}</p>
                <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  {driverStats.cancelledRides > 0 ? Math.round((driverStats.cancelledRides / maxRides) * 100) : 0}%
                </p>
                <div className="mt-2 w-16 h-16 mx-auto">
                  <Doughnut
                    data={cancelledRidesData}
                    options={{
                      cutout: '70%',
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
            <div>
                <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Rejected Rides</p>
                <p className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{driverStats.rejectedRides}</p>
                <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  {driverStats.rejectedRides > 0 ? Math.round((driverStats.rejectedRides / maxRides) * 100) : 0}%
                </p>
                <div className="mt-2 w-16 h-16 mx-auto">
                  <Doughnut
                    data={rejectedRidesData}
                    options={{
                      cutout: '70%',
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Driver Statistics */}
        <div className="space-y-6">
          <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
          
            <div className="space-y-6">
          
        
              <div>
                <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Income</p>
                <p className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>NGN {driverStats.income.toLocaleString()}</p>
                <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  {driverStats.income > 0 ? Math.round((driverStats.income / maxEarnings) * 100) : 0}%
                </p>
                <div className="mt-2 w-16 h-16 mx-auto">
                  <Doughnut
                    data={incomeData}
                    options={{
                      cutout: '70%',
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Commented-out Ride Status Breakdown (unchanged) */}
          {/* <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-800'} mb-4`}>Ride Status Breakdown</h3>
            <div className="relative w-40 h-40 mx-auto">
              <Doughnut
                data={rideStatusData}
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

export default DriverStatistics;