import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';


import { FaHireAHelper, FaHistory, FaStopwatch,  } from 'react-icons/fa';
import { FaTruck, } from 'react-icons/fa';
import { FaLightbulb } from 'react-icons/fa';

import { FaBars, FaChartBar, FaFilter, FaCar, FaMapMarkedAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import DriverHistory from './DriverHistory';
import Clients from './Clients';
import AvailableSchedules from './AvailableSchedules';
import AvailableRidesOrder from './AvailableRidesOrder';
import DriverStatistics from './DriverStatistics';
import FreightDriver from './FreightDriver';
import DriverRideStatistics from './DriverRideStatistics';
import WantToBeHired from './WantToBeHired';
import ProfilePage from './ProfilePage';

    const Navbar = ({ toggleTheme, isDarkTheme, profile }) => (
        <nav className={`fixed top-0 left-0 w-full z-50 shadow p-4 flex justify-between items-center ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
          <div className="flex items-center space-x-4">
            <h1 className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-green-600'}`}>ERide</h1>
            <div className="relative hidden sm:block">
              {/* Search bar placeholder */}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`px-3 py-1 rounded-full text-sm ${isDarkTheme ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              {isDarkTheme ? 'Light Theme' : 'Dark Theme'}
            </button>
            <div className="flex items-center space-x-2">
              <img
                src={profile.profilePicture || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium">{profile.userId?.firstName || 'User'}</span>
            </div>
          </div>
        </nav>
      );

const DriverDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [profile, setProfile] = useState({});
  const [clicks, setClicks] = useState(0);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

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
        console.log(profileData,"data!!!")

        if (profileData.slug) {
          const clicksResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/profile/get-clicks/${profileData.slug}`
          );
          setClicks(clicksResponse.data.clicks || 0);
        }

        const bookingsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/rides/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookings(bookingsResponse.data.history || []);

        toast.success(`You are welcome back ${profileResponse.data?.profile?.userId?.firstName}`, {
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

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const renderMainContent = () => {
    return (
      <div className={`flex-1 p-6 lg:p-8 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              className={`lg:hidden mr-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <FaBars size={24} />
            </button>
            <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
              {activeTab}
            </h2>
          </div>
        </div>

        {activeTab === 'History' && <DriverHistory isDarkTheme={isDarkTheme} />}
        {activeTab === 'clients' && <Clients isDarkTheme={isDarkTheme} />}
        {activeTab === 'rideStatistics' && <DriverRideStatistics isDarkTheme={isDarkTheme} />}
        {activeTab === 'Schedule' && <AvailableSchedules isDarkTheme={isDarkTheme} />}
        {activeTab === 'Freight' && <FreightDriver isDarkTheme={isDarkTheme} />}
        {activeTab === 'Dashboard' && <DriverStatistics isDarkTheme={isDarkTheme} />}
        {activeTab === 'Orders' && <AvailableRidesOrder isDarkTheme={isDarkTheme} />}
        {activeTab === 'wanttobehired' && <WantToBeHired isDarkTheme={isDarkTheme} />}
        {activeTab === 'profile' && <ProfilePage isDarkTheme={isDarkTheme} />}

      </div>
    );
  };

  return (
    <>
      <Navbar toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} profile={profile} />
      <div className={`flex min-h-screen font-sans ${isDarkTheme ? 'bg-gray-100' : 'bg-gray-200'}`}>
            <button
  className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-GreenColor text-white focus:outline-none"
  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
  aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
>
  {isSidebarOpen ? (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )}
</button>

          <div
        
          className={`fixed inset-y-0 left-0 w-64 bg-GreenColor shadow-lg transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 lg:static lg:w-1/5 p-6 flex flex-col justify-between ${
    isDarkTheme ? 'bg-GreenColor text-white' : 'bg-customGreen text-gray-800'}`}
        >

             <button
  className={`lg:hidden fixed top-4 right-4 z-60 p-2 rounded-md bg-GreenColor text-white focus:outline-none ${isSidebarOpen ? 'block' : 'hidden'}`}
  onClick={() => setIsSidebarOpen(false)}
  aria-label="Close sidebar"
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>
          <div>
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-900 rounded-md mr-2"></div>
              <h1 className="text-xl font-bold text-gray-800">ERide</h1>
            </div>
            <nav>
      <ul className="space-y-4">
        <li>
          <button
            onClick={() => {
              setActiveTab('Dashboard');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'Dashboard'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaChartBar className={`${isDarkTheme ? 'text-gray-300' : 'text-white'} mr-3`} /> Dashboard
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('Orders');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'Orders'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Available rides
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('History');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'History'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaHistory className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> History
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('wanttobehired');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'wanttobehired'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaHireAHelper className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Want to be hired as a driver?          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('clients');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'clients'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Clients
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('rideStatistics');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'rideStatistics'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaStopwatch className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Ride-Statistics
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('Freight');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'Freight'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Deliveries available
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('Schedule');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'Schedule'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaMapMarkedAlt className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Schedules
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('profile');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'profile'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaMapMarkedAlt className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Profile
          </button>
        </li>
        <li>
          <Link
            to="/login"
            className={`flex items-center ${isDarkTheme ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-gray-800'}`}
          >
            <FaUser className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-500'} mr-3`} /> Logout
          </Link>
        </li>
      </ul>
    </nav>
          </div>
          <div className="flex items-center">
            <img
              src={profile?.profilePicture || 'https://randomuser.me/api/portraits/women/44.jpg'}
              alt="User"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className={`${isDarkTheme ? 'text-green-400' : 'text-green-800'}`}>{profile.userId?.email || 'user@example.com'}</p>
              <p className={`${isDarkTheme ? 'text-white' : 'text-gray-800'} font-semibold`}>
                {profile.userId?.firstName || 'User'} {profile.userId?.lastName || ''}
              </p>
       
            </div>
          </div>
        </div>

        {renderMainContent()}
      </div>
    </>
  );
};

export default DriverDashboard;