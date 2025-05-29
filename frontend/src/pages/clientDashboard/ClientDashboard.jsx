import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import im from "../../assets/pic.jpg"
import im2 from "../../assets/Board Cover.jpg"
import CarsContent from './CarsContent';
import { FaHistory, FaRebel,  } from 'react-icons/fa';
import { FaTruck, } from 'react-icons/fa';
import { FaLightbulb } from 'react-icons/fa';
import StatisticsContent from './StatisticsContent';
import { FaBars, FaChartBar, FaFilter, FaCar, FaMapMarkedAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import Ride from './Ride';
import Schedule from './Schedule';
import History from './History';
import Freight from './Freight';
import OwnAcar from './OwnAcar';
import RideAlong from './RideAlong';
import { FaStopwatch } from 'react-icons/fa';
import RegisterVehicle from '../Vehicle/RegisterVehicle';
import OwnerDashboard from '../Vehicle/OwnerDashboard';
import RideStatistics from './RideStatistics';
import ReportDriver from './ReportDriver';
import HireADriver from './HireADriver';
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

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [profile, setProfile] = useState({});
  const [clicks, setClicks] = useState(0);
  const [isBackgroundOn, setIsBackgroundOn] = useState(true);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [carPositions, setCarPositions] = useState([
    { x: 50, y: 50, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 }, // Top-left
    { x: window.innerWidth - 50, y: 50, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 }, // Top-right
    { x: 50, y: window.innerHeight - 50, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 }, // Bottom-left
    { x: window.innerWidth - 50, y: window.innerHeight - 50, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 }, // Bottom-right
  ]);

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

        {activeTab === 'History' && <History isDarkTheme={isDarkTheme} />}
        {activeTab === 'Cars' && <CarsContent isDarkTheme={isDarkTheme} />}
        {activeTab === 'Freight' && <Freight isDarkTheme={isDarkTheme} />}
        {activeTab === 'OwnAcar' && <OwnAcar isDarkTheme={isDarkTheme} />}
        {activeTab === 'rideStatistics'  && <RideStatistics isDarkTheme={isDarkTheme} />}
        {activeTab === 'Schedule' && <Schedule isDarkTheme={isDarkTheme} />}
        {activeTab === 'Dashboard' && <StatisticsContent isDarkTheme={isDarkTheme} />}
        {activeTab === 'Ride-Along' && <RideAlong isDarkTheme={isDarkTheme} />}
        {activeTab === 'report' && <ReportDriver isDarkTheme={isDarkTheme} />}
        {activeTab === 'rent-vehicle' && <RegisterVehicle isDarkTheme={isDarkTheme} />}
        {activeTab === 'renting' && <OwnerDashboard isDarkTheme={isDarkTheme} />}
        {activeTab === 'Book' && <Ride isDarkTheme={isDarkTheme} />}
        {activeTab === 'hireadriver' && <HireADriver isDarkTheme={isDarkTheme} />}
      </div>
    );
  };

  return (
    <>
      <Navbar toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} profile={profile} />
    
{/* 
   
      {isBackgroundOn ? (
        <div
          className="absolute inset-0 bg-cover bg-center animate-car-cruise"
          style={{
            backgroundImage: `url(${im2})`,
            opacity: 0.10,
            zIndex: 0,
          }}
        ></div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 0,   opacity:0.15 }}>
          <img
            src={im2}
            alt="Static car"
            className="w-74 h-min-screen object-contain opacity-50"
          />
        </div>
      )}  */}
      <div  className={`flex min-h-screen font-sans ${isDarkTheme ? 'bg-gray-800' : 'bg-transparent'}`}
      style={{
        backgroundImage: isDarkTheme
          ? 'none'
          : `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${im})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {carPositions.length > 0 ? (
        carPositions.map((position, index) => (
          <div
            key={index}
            className="absolute transition-[left,top] duration-300 ease-linear"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            aria-label={`Driver location ${index + 1}`}
          >
            <FaCar size={40} className="text-yellow-500 animate-bounce" />
          </div>
        ))
      ) : (
        <p className="text-white">No active drivers found</p>
      )}
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
            <button
        onClick={() => setIsBackgroundOn(!isBackgroundOn)}
        className={`px-4 py-2 ml-2 rounded-lg shadow-md transition-colors ${
          isDarkTheme
            ? `bg-gray-800 text-white hover:bg-gray-700`
            : `bg-white text-gray-800 hover:bg-gray-100`
        }`}
        aria-label={isBackgroundOn ? 'Turn off car background' : 'Turn on car background'}
      >
        {isBackgroundOn ? 'stop ' : 'move'}
      </button>
          </button>
     
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('Book');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'Dashboard'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Book a ride
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
            <FaStopwatch className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Statistics
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
              setActiveTab('Freight');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'Freight'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaHistory className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} />Freight
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('Cars');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'Cars'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Drivers
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('OwnAcar');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'OwnAcar'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> have a car?
          </button>
        </li>
           <li>
          <button
            onClick={() => {
              setActiveTab('hireadriver');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'hireadriver'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Hire a driver?
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('rent-vehicle');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'rent-vehicle'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Rent your vehicle?
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab('report');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'report'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaRebel className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Report a driver?
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
            <FaMapMarkedAlt className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Schedule
          </button>
        </li>

        <li>
          <button
            onClick={() => {
              setActiveTab('renting');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'renting'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaMapMarkedAlt className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> who wants to rent
          </button>
        </li>


        <li>
          <button
            onClick={() => {
              setActiveTab('Ride-Along');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left ${
              activeTab === 'Ride-Along'
                ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
                : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
            }`}
          >
            <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Ride Along
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
              {/* <p className={`${isDarkTheme ? 'text-green-400' : 'text-green-800'}`}>{profile.userId?.email || 'user@example.com'}</p> */}
              <p className={`${isDarkTheme ? 'text-white' : 'text-gray-800'} font-semibold`}>
                {profile.userId?.firstName || 'User'} {profile.userId?.lastName || ''}
              </p>
              {/* <Link to="#" className={`${isDarkTheme ? 'text-gray-400 hover:underline' : 'text-gray-600 text-sm hover:underline'}`}>
                Visit site
              </Link> */}
            </div>
          </div>
        </div>

        {renderMainContent()}
      </div>
    </>
  );
};

export default ClientDashboard;














































// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'sonner';
// import im from "../../assets/pic.jpg"
// import im2 from "../../assets/Board Cover.jpg"
// import CarsContent from './CarsContent';
// import { FaHistory, FaRebel } from 'react-icons/fa';
// import { FaTruck } from 'react-icons/fa';
// import { FaLightbulb } from 'react-icons/fa';
// import StatisticsContent from './StatisticsContent';
// import { FaBars, FaChartBar, FaFilter, FaCar, FaMapMarkedAlt } from 'react-icons/fa';
// import { Link } from 'react-router-dom';
// import { FaUser } from 'react-icons/fa';
// import Ride from './Ride';
// import Schedule from './Schedule';
// import History from './History';
// import Freight from './Freight';
// import OwnAcar from './OwnAcar';
// import RideAlong from './RideAlong';
// import { FaStopwatch } from 'react-icons/fa';
// import RegisterVehicle from '../Vehicle/RegisterVehicle';
// import OwnerDashboard from '../Vehicle/OwnerDashboard';
// import RideStatistics from './RideStatistics';
// import ReportDriver from './ReportDriver';

// const Navbar = ({ toggleTheme, isDarkTheme, profile }) => (
//   <nav className={`fixed top-0 left-0 w-full z-50 shadow p-4 flex justify-between items-center ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
//     <div className="flex items-center space-x-4">
//       <h1 className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-green-600'}`}>ERide</h1>
//       <div className="relative hidden sm:block">
//         {/* Search bar placeholder */}
//       </div>
//     </div>
//     <div className="flex items-center space-x-4">
//       <button
//         onClick={toggleTheme}
//         className={`px-3 py-1 rounded-full text-sm ${isDarkTheme ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
//       >
//         {isDarkTheme ? 'Light Theme' : 'Dark Theme'}
//       </button>
//       <div className="flex items-center space-x-2">
//         <img
//           src={profile.profilePicture || 'https://via.placeholder.com/40'}
//           alt="Profile"
//           className="w-8 h-8 rounded-full"
//         />
//         <span className="text-sm font-medium">{profile.userId?.firstName || 'User'}</span>
//       </div>
//     </div>
//   </nav>
// );

// const ClientDashboard = () => {
//   const [activeTab, setActiveTab] = useState('Dashboard');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isDarkTheme, setIsDarkTheme] = useState(false);
//   const [profile, setProfile] = useState({});
//   const [clicks, setClicks] = useState(0);
//   const [isBackgroundOn, setIsBackgroundOn] = useState(true);
//   const [bookings, setBookings] = useState([]);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [carPositions, setCarPositions] = useState([
//     { x: 50, y: 50, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 }, // Top-left
//     { x: window.innerWidth - 50, y: 50, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 }, // Top-right
//     { x: 50, y: window.innerHeight - 50, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 }, // Bottom-left
//     { x: window.innerWidth - 50, y: window.innerHeight - 50, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 }, // Bottom-right
//   ]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       try {
//         const profileResponse = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         const profileData = profileResponse.data?.profile || {};
//         setProfile(profileData);
//         console.log(profileData, "data!!!");

//         if (profileData.slug) {
//           const clicksResponse = await axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/profile/get-clicks/${profileData.slug}`
//           );
//           setClicks(clicksResponse.data.clicks || 0);
//         }

//         const bookingsResponse = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/rides/history`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setBookings(bookingsResponse.data.history || []);

//         toast.success(`You are welcome back ${profileResponse.data?.profile?.userId?.firstName}`, {
//           style: { background: '#4CAF50', color: 'white' },
//         });
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//         toast.error('An error occurred while fetching dashboard data', {
//           style: { background: '#F44', color: 'white' },
//         });
//         if (error.response?.status === 401 || error.response?.status === 404) {
//           localStorage.removeItem('token');
//           navigate('/login');
//         }
//       }
//     };

//     fetchData();
//   }, [navigate]);

//   const toggleTheme = () => {
//     setIsDarkTheme(!isDarkTheme);
//   };

//   const renderMainContent = () => {
//     return (
//       <div className={`flex-1 p-6 lg:p-8 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center">
//             <button
//               className={`lg:hidden fixed top-4 left-4 z-60 p-2 rounded-md bg-GreenColor text-white focus:outline-none`}
//               onClick={() => {
//                 // console.log('Hamburger clicked, isSidebarOpen:', !isSidebarOpen); // Remove after testing
//                 setIsSidebarOpen(!isSidebarOpen);
//               }}
//             >
//               <FaBars size={24} />
//             </button>
//             <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
//               {activeTab}
//             </h2>
//           </div>
//         </div>

//         {activeTab === 'History' && <History isDarkTheme={isDarkTheme} />}
//         {activeTab === 'Cars' && <CarsContent isDarkTheme={isDarkTheme} />}
//         {activeTab === 'Freight' && <Freight isDarkTheme={isDarkTheme} />}
//         {activeTab === 'OwnAcar' && <OwnAcar isDarkTheme={isDarkTheme} />}
//         {activeTab === 'rideStatistics' && <RideStatistics isDarkTheme={isDarkTheme} />}
//         {activeTab === 'Schedule' && <Schedule isDarkTheme={isDarkTheme} />}
//         {activeTab === 'Dashboard' && <StatisticsContent isDarkTheme={isDarkTheme} />}
//         {activeTab === 'Ride-Along' && <RideAlong isDarkTheme={isDarkTheme} />}
//         {activeTab === 'report' && <ReportDriver isDarkTheme={isDarkTheme} />}
//         {activeTab === 'rent-vehicle' && <RegisterVehicle isDarkTheme={isDarkTheme} />}
//         {activeTab === 'renting' && <OwnerDashboard isDarkTheme={isDarkTheme} />}
//         {activeTab === 'Book' && <Ride isDarkTheme={isDarkTheme} />}
//       </div>
//     );
//   };

//   return (
//     <>
//       <Navbar toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} profile={profile} />
//       <div
//         className={`flex min-h-screen font-sans ${isDarkTheme ? 'bg-gray-800' : 'bg-transparent'}`}
//         style={{
//           backgroundImage: isDarkTheme
//             ? 'none'
//             : `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${im})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       >
//         {carPositions.length > 0 ? (
//           carPositions.map((position, index) => (
//             <div
//               key={index}
//               className="absolute transition-[left,top] duration-300 ease-linear"
//               style={{
//                 left: `${position.x}px`,
//                 top: `${position.y}px`,
//                 transform: 'translate(-50%, -50%)',
//               }}
//               aria-label={`Driver location ${index + 1}`}
//             >
//               <FaCar size={40} className="text-yellow-500 animate-bounce" />
//             </div>
//           ))
//         ) : (
//           <p className="text-white">No active drivers found</p>
//         )}
//         <div
//           className={`fixed inset-y-0 left-0 w-64 bg-GreenColor shadow-lg transform ${
//             isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 lg:static lg:w-1/5 p-6 flex flex-col justify-between ${
//             isDarkTheme ? 'bg-GreenColor text-white' : 'bg-customGreen text-gray-800'
//           }`}
//         >
//           <div>
//             <div className="flex items-center mb-8">
//               <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-900 rounded-md mr-2"></div>
//               <h1 className="text-xl font-bold text-gray-800">ERide</h1>
//             </div>
//             <nav>
//               <ul className="space-y-4">
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('Dashboard');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'Dashboard'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaChartBar className={`${isDarkTheme ? 'text-gray-300' : 'text-white'} mr-3`} /> Dashboard
//                     <button
//                       onClick={() => setIsBackgroundOn(!isBackgroundOn)}
//                       className={`px-4 py-2 ml-2 rounded-lg shadow-md transition-colors ${
//                         isDarkTheme
//                           ? `bg-gray-800 text-white hover:bg-gray-700`
//                           : `bg-white text-gray-800 hover:bg-gray-100`
//                       }`}
//                       aria-label={isBackgroundOn ? 'Turn off car background' : 'Turn on car background'}
//                     >
//                       {isBackgroundOn ? 'stop ' : 'move'}
//                     </button>
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('Book');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'Dashboard'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Book a ride
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('rideStatistics');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'rideStatistics'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaStopwatch className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Statistics
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('History');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'History'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaHistory className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> History
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('Freight');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'Freight'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaHistory className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Freight
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('Cars');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'Cars'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Drivers
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('OwnAcar');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'OwnAcar'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> have a car?
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('rent-vehicle');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'rent-vehicle'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Rent your vehicle?
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('report');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'report'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaRebel className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Report a driver?
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('Schedule');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'Schedule'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaMapMarkedAlt className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Schedule
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('renting');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'renting'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaMapMarkedAlt className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> who wants to rent
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => {
//                       setActiveTab('Ride-Along');
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center w-full text-left ${
//                       activeTab === 'Ride-Along'
//                         ? `${isDarkTheme ? 'text-white font-semibold' : 'text-black font-semibold'}`
//                         : `${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`
//                     }`}
//                   >
//                     <FaCar className={`${isDarkTheme ? 'text-gray-300' : 'text-black'} mr-3`} /> Ride Along
//                   </button>
//                 </li>
//                 <li>
//                   <Link
//                     to="/login"
//                     className={`flex items-center ${isDarkTheme ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-gray-800'}`}
//                   >
//                     <FaUser className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-500'} mr-3`} /> Logout
//                   </Link>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//           <div className="flex items-center">
//             <img
//               src={profile?.profilePicture || 'https://randomuser.me/api/portraits/women/44.jpg'}
//               alt="User"
//               className="w-10 h-10 rounded-full mr-3"
//             />
//             <div>
//               <p className={`${isDarkTheme ? 'text-green-400' : 'text-green-800'}`}>
//                 {profile.userId?.email || 'user@example.com'}
//               </p>
//               <p className={`${isDarkTheme ? 'text-white' : 'text-gray-800'} font-semibold`}>
//                 {profile.userId?.firstName || 'User'} {profile.userId?.lastName || ''}
//               </p>
//               <Link
//                 to="#"
//                 className={`${isDarkTheme ? 'text-gray-400 hover:underline' : 'text-gray-600 text-sm hover:underline'}`}
//               >
//                 Visit site
//               </Link>
//             </div>
//           </div>
//         </div>
//         {renderMainContent()}
//       </div>
//     </>
//   );
// };

// export default ClientDashboard;