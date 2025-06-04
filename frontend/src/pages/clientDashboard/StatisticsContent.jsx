import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaCar, FaChartBar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Intro from './Intro';
// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const StatisticsContent = ({ isDarkTheme }) => {
  const [profile, setProfile] = useState({});
  const [clicks, setClicks] = useState(0);
   const [showIntro, setShowIntro] = useState(false);
  const [profileId, setProfileId] = useState("")
  const [clientStats, setClientStats] = useState({
    totalBookings: 0,
    completedRides: 0,
    rejectedRides: 0,
    pendingBookings: 0,
    totalAmountSpent: 0,
    cancelledBookings: 0,
  });
  const navigate = useNavigate();

  // Check if modal has been shown before (using localStorage)
    useEffect(() => {
      const hasSeenIntro = localStorage.getItem('hasSeenIntro');
      if (!hasSeenIntro) {
        setShowIntro(true); // Show modal if not seen
        localStorage.setItem('hasSeenIntro', 'true'); // Mark as seen
      }
    }, []);
  
    // Function to close the modal
    const closeIntro = () => {
      setShowIntro(false);
    };
  

  // Fetch data using the provided useEffect
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
        console.log(profileResponse.data?.profile, "myprofile")
        setProfileId(profileResponse.data?.profile?._id)

        // Fetch clicks
        if (profileData.slug) {
          const clicksResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/profile/get-clicks/${profileData.slug}`
          );
          setClicks(clicksResponse.data.clicks || 0);
        }

         // Validate profileId (Profile._id)
         if (!profileData._id || typeof profileData._id !== 'string') {
            console.error('Invalid or missing profileId:', profileData._id);
            toast.error('Unable to fetch statistics: Invalid profile ID', {
              style: { background: '#F44', color: 'white' },
            });
            setClientStats({
              totalBookings: 0,
              completedRides: 0,
              rejectedRides: 0,
              pendingBookings: 0,
              totalAmountSpent: 0,
              cancelledBookings: 0,
            });
            return;
          }

        // Fetch client statistics
        const statsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/rides/client/${profileData._id}/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const statsData = statsResponse.data.stats || {};

        // Fetch ride history to count cancelled bookings
        const historyResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/rides/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const cancelledBookings = historyResponse.data.rides?.filter(
          (ride) => ride.status === 'cancelled'
        ).length || 0;

        setClientStats({
          totalBookings: statsData.totalBookings || 0,
          completedRides: statsData.completedRides || 0,
          rejectedRides: statsData.rejectedRides || 0,
          pendingBookings: statsData.pendingBookings || 0,
          totalAmountSpent: statsData.totalAmountSpent || 0,
          cancelledBookings,
        });

        toast.success('You are welcome back', {
          style: { background: '#4CAF50', color: 'white' },
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 403) {
            if (error.response?.data?.error.includes('Unauthorized')) {
              toast.error('Unauthorized: Invalid client ID', {
                style: { background: '#F44', color: 'white' },
              });
            } else if (error.response?.data?.error.includes('Invalid client')) {
              toast.error('Profile role mismatch: Expected "client" role', {
                style: { background: '#F44', color: 'white' },
              });
            }
          } else {
            toast.error('An error occurred while fetching dashboard data', {
              style: { background: '#F44', color: 'white' },
            });
          }
          if (error.response?.status === 401 || error.response?.status === 404) {
            localStorage.removeItem('token');
            navigate('/login');
          }
      }
    };

    fetchData();
  }, [navigate]);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Vehicle Type Distribution (unchanged)
  const vehicleTypes = clientStats.totalBookings > 0
    ? { Sedan: 30, Crossover: 25, Coupe: 20, SUV: 25 } // Placeholder data
    : { Sedan: 0, Crossover: 0, Coupe: 0, SUV: 0 };
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

  // Chart data for statistics
  const maxBookings = 100;
  const maxAmount = 100000; // NGN

  const totalBookingsData = {
    labels: ['Total Bookings'],
    datasets: [
      {
        data: [
          clientStats.totalBookings > 0 ? Math.round((clientStats.totalBookings / maxBookings) * 100) : 0,
          100 - (clientStats.totalBookings > 0 ? Math.round((clientStats.totalBookings / maxBookings) * 100) : 0),
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
          clientStats.completedRides > 0 ? Math.round((clientStats.completedRides / maxBookings) * 100) : 0,
          100 - (clientStats.completedRides > 0 ? Math.round((clientStats.completedRides / maxBookings) * 100) : 0),
        ],
        backgroundColor: ['#50C878', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  const pendingBookingsData = {
    labels: ['Pending Bookings'],
    datasets: [
      {
        data: [
          clientStats.pendingBookings > 0 ? Math.round((clientStats.pendingBookings / maxBookings) * 100) : 0,
          100 - (clientStats.pendingBookings > 0 ? Math.round((clientStats.pendingBookings / maxBookings) * 100) : 0),
        ],
        backgroundColor: ['#FBBF24', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
    },
    ],
  };

  const cancelledBookingsData = {
    labels: ['Cancelled Bookings'],
    datasets: [
      {
        data: [
          clientStats.cancelledBookings > 0 ? Math.round((clientStats.cancelledBookings / maxBookings) * 100) : 0,
          100 - (clientStats.cancelledBookings > 0 ? Math.round((clientStats.cancelledBookings / maxBookings) * 100) : 0),
        ],
        backgroundColor: ['#FF6B6B', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
    },
],
  };

  const totalAmountSpentData = {
    labels: ['Total Amount Spent'],
    datasets: [
      {
        data: [
          clientStats.totalAmountSpent > 0 ? Math.round((clientStats.totalAmountSpent / maxAmount) * 100) : 0,
          100 - (clientStats.totalAmountSpent > 0 ? Math.round((clientStats.totalAmountSpent / maxAmount) * 100) : 0),
        ],
        backgroundColor: ['#8B5CF6', isDarkTheme ? '#4B5563' : '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <>
        {/* {showIntro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="">
         
            <Intro />
            
            <button
              onClick={closeIntro}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )} */}
      {isModalOpen && <Intro closeModal={closeModal} />}
       <div className={`p-6 lg:p-8 ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6">Statistics</h2>


  

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Statistics Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Total Bookings</p>
              <div className="p-4 bg-blue-100 rounded-lg mr-4">
            <FaCar className="text-blue-600 text-2xl" />
          </div>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{clientStats.totalBookings}</p>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {clientStats.totalBookings > 0 ? Math.round((clientStats.totalBookings / maxBookings) * 100) : 0}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut
                  data={totalBookingsData}
                  options={{
                    cutout: '70%',
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
            <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Completed Rides</p>
              <div className="p-4 bg-green-100 rounded-lg mr-4">
            <FaCheckCircle className="text-green-600 text-2xl" />
          </div>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{clientStats.completedRides}</p>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {clientStats.completedRides > 0 ? Math.round((clientStats.completedRides / maxBookings) * 100) : 0}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut
                  data={completedRidesData}
                  options={{
                    cutout: '70%',
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
            <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Pending Bookings</p>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{clientStats.pendingBookings}</p>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {clientStats.pendingBookings > 0 ? Math.round((clientStats.pendingBookings / maxBookings) * 100) : 0}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut
                  data={pendingBookingsData}
                  options={{
                    cutout: '70%',
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
            <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Cancelled Bookings</p>
              <div className="p-4 bg-red-100 rounded-lg mr-4">
            <FaChartBar className="text-red-600 text-2xl" />
          </div>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{clientStats.cancelledBookings}</p>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {clientStats.cancelledBookings > 0 ? Math.round((clientStats.cancelledBookings / maxBookings) * 100) : 0}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut
                  data={cancelledBookingsData}
                  options={{
                    cutout: '70%',
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          
          </div>
        </div>

        {/* Ride statistics Section: */}
        <div className="space-y-6">
        <div className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Total Amount Spent</p>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>NGN {clientStats.totalAmountSpent.toLocaleString()}</p>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {clientStats.totalAmountSpent > 0 ? Math.round((clientStats.totalAmountSpent / maxAmount) * 100) : 0}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut
                  data={totalAmountSpentData}
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
  
    </>
   
  );
};

export default StatisticsContent;




























