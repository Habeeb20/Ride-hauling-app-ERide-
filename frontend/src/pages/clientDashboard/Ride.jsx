import { useState, useEffect } from 'react';
import axios from 'axios';
import Autocomplete from 'react-google-autocomplete';
import { FaArrowLeft, FaInfoCircle, FaSun, FaMoon, FaCar, FaEye, FaTimes, FaRoute, FaPhone } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import im from "../../assets/Board Cover.jpg";
import im2 from "../../assets/Car rental logo_ 12_667 fotos e imagens stock livres de direitos _ Shutterstock.jpg";
import im3 from "../../assets/download.jpg";

function Ride() {
  const [rideForm, setRideForm] = useState({
    pickupAddress: "",
    destinationAddress: "",
    distance: "",
    calculatedPrice: "",
    desiredPrice: "",
    passengerNum: "",
    rideOption: "economy",
    paymentMethod: "",
  });
  const [showMap, setShowMap] = useState(false);
  const [rideStarted, setRideStarted] = useState(false);
  const [rideProgress, setRideProgress] = useState(0);
  const [rideStatus, setRideStatus] = useState('');
  const [driverDetails, setDriverDetails] = useState(null);
  const [eta, setEta] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [rideHistory, setRideHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [deliveryId, setDeliveryId] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isCreatingRide, setIsCreatingRide] = useState(false);
  const [passenger, setPassenger] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passengerId, setPassengerId] = useState('');
  const [theme, setTheme] = useState('light');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showFeatures, setShowFeatures] = useState({ economy: false, premium: false, shared: false });
  const [interestedDrivers, setInterestedDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const embedApiKey = import.meta.env.VITE_EMBED_API_KEY;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const socket = io(import.meta.env.VITE_BACKEND_URL, {
    auth: { token },
    autoConnect: false,
  });

  const navItems = [
    ...(rideStarted ? [{ id: 'city', label: 'Track Ride', icon: FaRoute, onClick: () => navigate(`/ride-tracking/${deliveryId}`) }] : []),
  ];

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'User-Agent': 'e_RideProject/1.0' } }
            );
            const data = await response.json();
            setRideForm((prev) => ({ ...prev, pickupAddress: data.display_name || 'Current Location' }));
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            setRideForm((prev) => ({ ...prev, pickupAddress: 'Current Location' }));
          }
        },
        (error) => {
          console.error("Location access denied:", error.message);
          setRideForm((prev) => ({ ...prev, pickupAddress: 'Unable to fetch location' }));
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!token) {
        toast.error('Please log in to access the dashboard', { style: { background: '#F44336', color: 'white' } });
        navigate('/plogin');
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.status) {
          setData(response.data.data);
          setPassengerId(response.data.data?._id);
          setPassenger(response.data.data);
          toast.success('Book a ride with ease', { style: { background: '#4CAF50', color: 'white' } });
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'An error occurred';
        toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/plogin');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchNearbyDrivers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/nearby`);
        setNearbyDrivers(response.data);
      } catch (error) {
        console.error('Error fetching nearby drivers:', error);
      }
    };
    fetchNearbyDrivers();
  }, []);

  useEffect(() => {
    if (!token || !deliveryId) return;

    socket.connect();
    socket.emit('joinRide', deliveryId);

    socket.on('driverNegotiated', (driver) => {
      setInterestedDrivers((prev) => {
        const exists = prev.find(d => d._id === driver._id);
        if (exists) {
          return prev.map(d => d._id === driver._id ? driver : d);
        }
        return [...prev, driver];
      });
      toast.info(`${driver.firstName} has proposed a price of ₦${driver.driverProposedPrice}`, {
        style: { background: '#2196F3', color: 'white' }
      });
    });

    socket.on('driverAccepted', (data) => {
      const { driver } = data;
      setSelectedDriver({
        _id: driver._id,
        firstName: driver.firstName,
        carDetails: {
          model: driver.carDetails.model,
          year: driver.carDetails.year,
          plateNumber: driver.carDetails.plateNumber,
        },
        distance: driver.distance || 'Calculating...',
        driverProposedPrice: driver.driverProposedPrice || rideForm.calculatedPrice,
        rating: driver.rating || 'N/A',
      });
      setShowDriverModal(true);
      toast.info(`${driver.firstName} has accepted your ride request`, {
        style: { background: '#2196F3', color: 'white' }
      });
    });

    socket.on('rideConfirmed', (data) => {
      const { driver } = data;
      setDriverDetails({
        name: driver.firstName,
        car: `${driver.carDetails.model} (${driver.carDetails.year})`,
        licensePlate: driver.carDetails.plateNumber,
        distance: driver.distance || 'Calculating...',
        driverProposedPrice: driver.driverProposedPrice || rideForm.calculatedPrice,
      });
      setRideStarted(true);
      setEta('5 minutes');
      setInterestedDrivers([]);
      setShowDriverModal(false);
      toast.success(`${driver.firstName} has been assigned to your ride`, {
        style: { background: '#4CAF50', color: 'white' }
      });
    });

    socket.on('driverOfferRejected', (data) => {
      setInterestedDrivers((prev) => prev.filter((d) => d._id !== data.driverId));
      setShowDriverModal(false);
      setSelectedDriver(null);
    });

    return () => socket.disconnect();
  }, [deliveryId, token]);

  useEffect(() => {
    if (!rideStarted || !deliveryId) return;
    const interval = setInterval(() => {
      setRideProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRideStatus('Ride completed');
          toast.success('Ride completed');
          axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/rides/${deliveryId}/status`, { status: 'completed' });
          return 100;
        }
        const newProgress = prev + 2;
        if (newProgress < 50) setRideStatus('Driver is on the way');
        else if (newProgress === 50) setRideStatus('Driver has arrived');
        else setRideStatus('Ride in progress');
        return newProgress;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [rideStarted, deliveryId]);

  useEffect(() => {
    if (!passengerId) return;
    const fetchRideHistory = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/passenger/${passengerId}`);
        setRideHistory(response.data);
      } catch (error) {
        console.error('Error fetching ride history:', error);
      }
    };
    fetchRideHistory();
  }, [rideStatus, passengerId]);

  const calculateDistanceAndFare = async () => {
    if (!rideForm.pickupAddress || !rideForm.destinationAddress) {
      toast.error("Please enter pickup and destination addresses", { style: { background: "#F44336", color: "white" } });
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/calculate-fare`, {
        pickupAddress: rideForm.pickupAddress,
        destinationAddress: rideForm.destinationAddress,
      });
      let { distance, price } = response.data;
      if (rideForm.rideOption === 'premium') price *= 1.5;
      if (rideForm.rideOption === 'shared') price *= 0.7;
      setRideForm((prev) => ({
        ...prev,
        distance,
        calculatedPrice: price,
      }));
      setEta('5 minutes');
      setShowMap(true);
    } catch (error) {
      toast.error("Error calculating fare", { style: { background: "#F44336", color: "white" } });
      console.error('Error calculating fare:', error.response?.data || error);
      setRideForm((prev) => ({ ...prev, distance: "", calculatedPrice: "" }));
    }
  };

  const handleRideSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to book a ride", { style: { background: "#F44336", color: "white" } });
      navigate("/plogin");
      return;
    }
    if (!rideForm.distance || !rideForm.calculatedPrice || !rideForm.paymentMethod || !rideForm.rideOption) {
      toast.error("Please calculate fare and select all required fields", { style: { background: "#F44336", color: "white" } });
      return;
    }
    if (isCreatingRide) return;

    setIsCreatingRide(true);
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/create`,
        {
          pickupAddress: rideForm.pickupAddress,
          destinationAddress: rideForm.destinationAddress,
          distance: rideForm.distance,
          passengerNum: rideForm.passengerNum,
          calculatedPrice: rideForm.calculatedPrice,
          desiredPrice: rideForm.desiredPrice || null,
          rideOption: rideForm.rideOption,
          paymentMethod: rideForm.paymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeliveryId(response.data._id);
      setShowMap(true);
      toast.success("Ride request created successfully", { style: { background: "#4CAF50", color: "white" } });
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to create ride request";
      toast.error(errorMessage, { style: { background: "#F44336", color: "white" } });
    } finally {
      setLoading(false);
      setIsCreatingRide(false);
    }
  };

  const handleAcceptDriver = async (driverId) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${deliveryId}/confirm-driver`,
        { driverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Driver confirmed successfully', { style: { background: '#4CAF50', color: 'white' } });
    } catch (error) {
      console.error('Error confirming driver:', error);
      const errorMessage = error.response?.data?.error || 'Failed to confirm driver';
      toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDriver = async (driverId) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${deliveryId}/reject-driver`,
        { driverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info('Driver proposal rejected', { style: { background: '#2196F3', color: 'white' } });
    } catch (error) {
      console.error('Error rejecting driver:', error);
      const errorMessage = error.response?.data?.error || 'Failed to reject driver';
      toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${deliveryId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRideStarted(false);
      setDriverDetails(null);
      setDeliveryId(null);
      setRideProgress(0);
      setRideStatus('');
      setInterestedDrivers([]);
      toast.success("Ride cancelled successfully", { style: { background: "#4CAF50", color: "white" } });
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to cancel ride";
      toast.error(errorMessage, { style: { background: "#F44336", color: "white" } });
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !rideStarted) return;
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rides/${deliveryId}/chat`, {
        sender: 'passenger',
        text: newMessage,
      });
      setChatMessages([...chatMessages, { sender: 'passenger', text: newMessage }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const submitRatingAndReview = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rides/${deliveryId}/rate`, { rating, review });
      toast.success('Rating and review submitted');
    } catch (error) {
      console.error('Error submitting rating/review:', error);
    }
  };

  const mapUrl = showMap
  ? `https://www.google.com/maps/embed/v1/directions?key=${embedApiKey}&origin=${encodeURIComponent(rideForm.pickupAddress)}&destination=${encodeURIComponent(rideForm.destinationAddress)}&mode=driving`
  : `https://www.google.com/maps/embed/v1/view?key=${embedApiKey}&center=${currentLocation?.lat || 0},${currentLocation?.lng || 0}&zoom=15`;

  const toggleFeatures = (option) => setShowFeatures((prev) => ({ ...prev, [option]: !prev[option] }));

  return (
    <div className={`min-h-screen font-sans flex flex-col ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between p-4 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-gray-700'}`}>
        <div className="flex items-center space-x-3">
          <h1 className={`text-lg font-semibold ${theme === 'light' ? 'text-customGreen' : 'text-white'}`}>Book a ride</h1>
          <button onClick={toggleTheme} className={`${theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-white'}`}>
            {theme === 'light' ? <FaMoon size={20} /> : <FaSun size={20} />}
          </button>
        </div>
        <button onClick={() => setShowProfile(!showProfile)}>
          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden shadow-sm">
            {passenger?.profilePicture && <img src={passenger.profilePicture} alt="Profile" className="w-full h-full object-cover" />}
          </div>
        </button>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 w-11/12 max-w-md max-h-[80vh] overflow-y-auto ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-gray-700'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Profile</h2>
              <button onClick={() => setShowProfile(false)} className={`${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 hover:text-white'}`}>
                <FaTimes size={20} />
              </button>
            </div>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Name: {passenger?.firstName || 'James'}</p>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Email: {passenger?.userEmail || 'james@example.com'}</p>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Phone: {passenger?.phoneNumber}</p>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Location: {passenger?.location?.state}, {passenger?.location?.lga}</p>
            {passenger?.question && <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Status: {passenger.question}</p>}
            {passenger?.schoolIdUrl && (
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                School ID: <a href={passenger.schoolIdUrl} target="_blank" rel="noopener noreferrer" className={`${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'} hover:underline`}>View</a>
              </p>
            )}
            <h3 className={`text-sm font-semibold mt-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Ride History</h3>
            {rideHistory.length > 0 ? (
              <ul className="space-y-2 mt-2">
                {rideHistory.map((ride, index) => (
                  <li key={index} className={`border p-3 rounded-lg ${theme === 'light' ? 'border-gray-200' : 'border-gray-600'}`}>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>From: {ride.pickupAddress}</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>To: {ride.destinationAddress}</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Distance: {ride.distance} km</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Price: ₦{ride.calculatedPrice}</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Date: {new Date(ride.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>No rides yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDriverModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 w-11/12 max-w-md ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-gray-700'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Driver Proposal</h2>
              <button onClick={() => setShowDriverModal(false)} className={`${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 hover:text-white'}`}>
                <FaTimes size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-customGreen">
                  <img
                    src={selectedDriver?.profilePicture || "https://via.placeholder.com/150"}
                    alt={`${selectedDriver.firstName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedDriver.firstName}</p>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{selectedDriver.carDetails.model} ({selectedDriver.carDetails.year})</p>
                </div>
                <button
                  onClick={() => window.open(selectedDriver?.profilePicture || "https://via.placeholder.com/150", "_blank")}
                  className={`text-sm px-3 py-1 rounded-full ${theme === 'light' ? 'bg-GreenColor text-customGreen' : 'bg-GreenColor text-GreenColor'} hover:bg-GreenColor transition-colors`}
                >
                  View
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-customGreen">
                  <img
                    src={selectedDriver?.carPicture || "https://via.placeholder.com/150"}
                    alt={`${selectedDriver.carDetails.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedDriver.carDetails.model}</p>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Color: {selectedDriver.carDetails.color}</p>
                </div>
                <button
                  onClick={() => window.open(selectedDriver?.carPicture || "https://via.placeholder.com/150", "_blank")}
                  className={`text-sm px-3 py-1 rounded-full ${theme === 'light' ? 'bg-GreenColor text-customGreen' : 'bg-GreenColor text-GreenColor'} hover:bg-GreenColor transition-colors`}
                >
                  View
                </button>
              </div>
              <div className={`grid grid-cols-2 gap-2 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                <p>License Plate:</p>
                <p className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedDriver.carDetails.plateNumber}</p>
                <p>Distance:</p>
                <p className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedDriver.distance || 'Unknown'}</p>
                <p>Rating:</p>
                <p className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedDriver.rating || 'N/A'}</p>
                <p>Contact:</p>
                <p>
                  <a
                    href={`tel:${selectedDriver?.phoneNumber}`}
                    className={`${theme === 'light' ? 'text-customGreen hover:text-customGreen' : 'text-GreenColor hover:text-GreenColor'} font-medium flex items-center`}
                  >
                    <FaPhone className="mr-1" /> {selectedDriver?.phoneNumber || 'N/A'}
                  </a>
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-600'}`}>
                <h3 className={`text-sm font-semibold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Price Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>System Calculated:</span>
                    <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{rideForm.calculatedPrice}</span>
                  </div>
                  {rideForm.desiredPrice && (
                    <div className="flex justify-between">
                      <span>Your Offered Price:</span>
                      <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{rideForm.desiredPrice}</span>
                    </div>
                  )}
                  {selectedDriver.driverProposedPrice && (
                    <div className="flex justify-between">
                      <span>Driver's Price:</span>
                      <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{selectedDriver.driverProposedPrice}</span>
                    </div>
                  )}
                  <div className={`flex justify-between pt-2 border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-500'}`}>
                    <span className="font-medium">Final Price:</span>
                    <span className={`font-semibold ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'}`}>
                      ₦{selectedDriver.driverProposedPrice || rideForm.desiredPrice || rideForm.calculatedPrice}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAcceptDriver(selectedDriver._id)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-customGreen text-white hover:bg-customGreen' : 'bg-customGreen text-white hover:bg-customGreen'}`}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Accept Driver'}
                </button>
                <button
                  onClick={() => handleRejectDriver(selectedDriver._id)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Reject Driver'}
                </button>
              </div>
              {rideStarted && (
                <button
                  onClick={() => navigate(`/ride-tracking/${deliveryId}`)}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  Track Ride
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-4 md:gap-6">
        {/* Ride Details Section */}
        <div className={`lg:w-1/3 w-full rounded-2xl shadow-lg p-4 md:p-6 ${theme === 'light' ? 'bg-white' : 'bg-gray-900'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Book A Ride</h3>
          <form onSubmit={handleRideSubmit}>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Pickup Address</label>
              <Autocomplete
                apiKey={googleMapsApiKey}
                onPlaceSelected={(place) => {
                  if (place?.formatted_address) setRideForm((prev) => ({ ...prev, pickupAddress: place.formatted_address }));
                }}
                options={{ types: ['geocode'], componentRestrictions: { country: 'ng' } }}
                value={rideForm.pickupAddress}
                onChange={(e) => setRideForm((prev) => ({ ...prev, pickupAddress: e.target.value }))}
                className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent ${theme === 'light' ? 'border-gray-200 bg-white text-gray-800' : 'border-gray-600 bg-gray-600 text-white'}`}
                placeholder="Enter pickup location"
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Destination Address</label>
              <Autocomplete
                apiKey={googleMapsApiKey}
                onPlaceSelected={(place) => {
                  if (place?.formatted_address) setRideForm((prev) => ({ ...prev, destinationAddress: place.formatted_address }));
                }}
                options={{ types: ['geocode'], componentRestrictions: { country: 'ng' } }}
                value={rideForm.destinationAddress}
                onChange={(e) => setRideForm((prev) => ({ ...prev, destinationAddress: e.target.value }))}
                className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent ${theme === 'light' ? 'border-gray-200 bg-white text-gray-800' : 'border-gray-600 bg-gray-600 text-white'}`}
                placeholder="Enter destination"
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Ride Option</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${rideForm.rideOption === 'economy' ? 'border-customGreen bg-GreenColor' : theme === 'light' ? 'border-gray-200' : 'border-gray-600'}`}
                  onClick={() => setRideForm((prev) => ({ ...prev, rideOption: 'economy' }))}
                >
                  <img src={im} alt="Economy Car" className="w-full h-20 object-cover rounded-lg mb-2" />
                  <p className={`text-center text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Economy</p>
                  <button onClick={(e) => { e.stopPropagation(); toggleFeatures('economy'); }} className={`flex items-center justify-center w-full mt-1 text-sm ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'} hover:underline`}>
                    <FaInfoCircle className="mr-1" /> See More
                  </button>
                  {showFeatures.economy && (
                    <ul className={`text-xs mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                      <li>- Affordable pricing</li>
                      <li>- Standard delivery time</li>
                      <li>- Basic vehicle</li>
                    </ul>
                  )}
                </div>
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${rideForm.rideOption === 'premium' ? 'border-customGreen bg-GreenColor' : theme === 'light' ? 'border-gray-200' : 'border-gray-600'}`}
                  onClick={() => setRideForm((prev) => ({ ...prev, rideOption: 'premium' }))}
                >
                  <img src={im2} alt="Premium Car" className="w-full h-20 object-cover rounded-lg mb-2" />
                  <p className={`text-center text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Premium</p>
                  <button onClick={(e) => { e.stopPropagation(); toggleFeatures('premium'); }} className={`flex items-center justify-center w-full mt-1 text-sm ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'} hover:underline`}>
                    <FaInfoCircle className="mr-1" /> See More
                  </button>
                  {showFeatures.premium && (
                    <ul className={`text-xs mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                      <li>- Higher price</li>
                      <li>- Faster delivery</li>
                      <li>-(Personally Owned) Luxury vehicle</li>
                    </ul>
                  )}
                </div>
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${rideForm.rideOption === 'shared' ? 'border-customGreen bg-GreenColor' : theme === 'light' ? 'border-gray-200' : 'border-gray-600'}`}
                  onClick={() => setRideForm((prev) => ({ ...prev, rideOption: 'shared' }))}
                >
                  <img src={im3} alt="Shared Car" className="w-full h-20 object-cover rounded-lg mb-2" />
                  <p className={`text-center text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Shared</p>
                  <button onClick={(e) => { e.stopPropagation(); toggleFeatures('shared'); }} className={`flex items-center justify-center w-full mt-1 text-sm ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'} hover:underline`}>
                    <FaInfoCircle className="mr-1" /> See More
                  </button>
                  {showFeatures.shared && (
                    <ul className={`text-xs mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                      <li>- Cheapest option</li>
                      <li>- Shared with others</li>
                      <li>- Longer delivery time</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Your Offered Fare (₦)</label>
              <input
                type="number"
                value={rideForm.desiredPrice}
                onChange={(e) => setRideForm((prev) => ({ ...prev, desiredPrice: e.target.value }))}
                className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent ${theme === 'light' ? 'border-gray-200 bg-white text-gray-800' : 'border-gray-600 bg-gray-600 text-white'}`}
                placeholder="Enter your offered fare (optional)"
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>How many passengers</label>
              <input
                type="number"
                value={rideForm.passengerNum}
                onChange={(e) => setRideForm((prev) => ({ ...prev, passengerNum: e.target.value }))}
                className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent ${theme === 'light' ? 'border-gray-200 bg-white text-gray-800' : 'border-gray-600 bg-gray-600 text-white'}`}
                placeholder="Number of passengers"
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Payment Method</label>
              <select
                value={rideForm.paymentMethod}
                onChange={(e) => setRideForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent ${theme === 'light' ? 'border-gray-200 bg-white text-gray-800' : 'border-gray-600 bg-gray-600 text-white'}`}
              >
                <option value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <button
              type="button"
              onClick={calculateDistanceAndFare}
              className={`w-full py-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-customGreen text-white hover:bg-customGreen' : 'bg-customGreen text-white hover:bg-customGreen'}`}
            >
              Calculate Fare
            </button>

            <div className={`mt-4 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              <p>Distance: {rideForm.distance ? `${rideForm.distance} km` : 'Not calculated'}</p>
              <p>Calculated Price: <span className={`font-semibold ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'}`}>{rideForm.calculatedPrice ? `₦${rideForm.calculatedPrice}` : 'Not calculated'}</span></p>
              {rideForm.desiredPrice && (
                <p>Desired Price: <span className={`font-semibold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>₦{rideForm.desiredPrice}</span></p>
              )}
            </div>

            {rideForm.distance && rideForm.calculatedPrice && !rideStarted && (
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 mt-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-customGreen text-white hover:bg-customGreen' : 'bg-customGreen text-white hover:bg-customGreen'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Booking...' : 'Book Ride'}
              </button>
            )}

            {deliveryId && !rideStarted && (
              <div className="mt-4">
                <h4 className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                  Interested Drivers
                </h4>
                {interestedDrivers.length > 0 ? (
                  <ul className="space-y-3 mt-2">
                    {interestedDrivers.map((driver) => (
                      <li
                        key={driver._id}
                        className={`p-4 rounded-lg shadow-sm ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-600 border border-gray-500'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-customGreen">
                              <img
                                src={driver?.profilePicture || "https://via.placeholder.com/150"}
                                alt={driver.firstName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                {driver.firstName}
                              </p>
                              <p className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                Distance: {driver.distance || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDriver(driver);
                              setShowDriverModal(true);
                            }}
                            className={`text-sm px-3 py-1 rounded-full ${theme === 'light' ? 'bg-GreenColor text-customGreen' : 'bg-GreenColor text-GreenColor'} hover:bg-GreenColor transition-colors flex items-center`}
                          >
                            <FaEye className="mr-1" /> Details
                          </button>
                        </div>
                        <div className={`mt-3 p-3 rounded-lg text-sm ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-500'}`}>
                          <div className="flex justify-between">
                            <span>System Price:</span>
                            <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{rideForm.calculatedPrice}</span>
                          </div>
                          {rideForm.desiredPrice && (
                            <div className="flex justify-between">
                              <span>Your Offer:</span>
                              <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{rideForm.desiredPrice}</span>
                            </div>
                          )}
                          {driver.driverProposedPrice && (
                            <div className="flex justify-between">
                              <span>Driver's Price:</span>
                              <span className={`font-medium ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'}`}>
                                ₦{driver.driverProposedPrice}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between mt-1 pt-1 border-t border-gray-200">
                            <span className="font-medium">Final Price:</span>
                            <span className={`font-semibold ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'}`}>
                              ₦{driver.driverProposedPrice || rideForm.desiredPrice || rideForm.calculatedPrice}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`p-4 text-center text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                    Waiting for drivers to respond to your request...
                  </p>
                )}
              </div>
            )}

            {rideStarted && driverDetails && (
              <div className={`border-t pt-4 mt-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                <h4 className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Driver Details</h4>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-customGreen">
                    <img
                      src={driverDetails?.profilePicture || "https://via.placeholder.com/150"}
                      alt={driverDetails.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Name: {driverDetails.name}</p>
                    <p className="text-xs">Car: {driverDetails.car}</p>
                    <p className="text-xs">License Plate: {driverDetails.licensePlate}</p>
                    <p className="text-xs">Distance: {driverDetails.distance}</p>
                    <p className="text-xs">ETA: {eta}</p>
                  </div>
                </div>
                <div className={`mt-3 p-3 rounded-lg text-sm ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-500'}`}>
                  <h5 className={`font-semibold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Price Information</h5>
                  <p>Calculated Price: <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{rideForm.calculatedPrice ? `₦${rideForm.calculatedPrice}` : 'N/A'}</span></p>
                  {rideForm.desiredPrice && (
                    <p>Your Offered Price: <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{rideForm.desiredPrice}</span></p>
                  )}
                  {driverDetails.driverProposedPrice && (
                    <p>Driver's Price: <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{driverDetails.driverProposedPrice}</span></p>
                  )}
                  <p className="mt-2">
                    Final Price: <span className={`font-semibold ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'}`}>
                      ₦{driverDetails.driverProposedPrice || rideForm.desiredPrice || rideForm.calculatedPrice}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleCancelRide}
                  className={`w-full py-2 mt-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
                  disabled={loading}
                >
                  {loading ? 'Cancelling...' : 'Cancel Ride'}
                </button>
              </div>
            )}

            {rideStarted && (
              <div className="mt-4">
                <h4 className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Ride Status: {rideStatus}</h4>
                <div className={`w-full rounded-full h-2 mt-2 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-500'}`}>
                  <div className="bg-customGreen h-2 rounded-full" style={{ width: `${rideProgress}%` }}></div>
                </div>
              </div>
            )}

            {rideStarted && (
              <div className="mt-4">
                <h4 className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Chat with Driver</h4>
                <div className={`border p-3 rounded-lg h-24 overflow-y-auto text-sm ${theme === 'light' ? 'border-gray-200' : 'border-gray-500'}`}>
                  {chatMessages.map((msg, index) => (
                    <p key={index} className={msg.sender === 'passenger' ? 'text-right text-customGreen' : `text-left ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                      {msg.sender === 'passenger' ? 'You' : 'Driver'}: {msg.text}
                    </p>
                  ))}
                </div>
                <div className="flex mt-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className={`flex-1 p-3 border rounded-lg text-sm ${theme === 'light' ? 'border-gray-200 bg-white text-gray-800' : 'border-gray-600 bg-gray-600 text-white'}`}
                    placeholder="Type a message..."
                  />
                  <button onClick={sendChatMessage} className={`ml-2 px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-customGreen text-white hover:bg-customGreen' : 'bg-customGreen text-white hover:bg-customGreen'} transition-colors`}>Send</button>
                </div>
              </div>
            )}

            {rideStatus === 'Ride completed' && !paymentCompleted && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setPaymentCompleted(true);
                    toast.success(`Payment of ₦${rideForm.calculatedPrice} completed via ${rideForm.paymentMethod}`);
                  }}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-customGreen text-white hover:bg-customGreen' : 'bg-customGreen text-white hover:bg-customGreen'}`}
                >
                  Complete Payment
                </button>
              </div>
            )}

            {paymentCompleted && (
              <div className="mt-4">
                <h4 className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Rate and Review Driver</h4>
                <div className="flex items-center space-x-2 mt-2">
                  <label className={`text-sm font-medium ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Rating (1-5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className={`w-16 p-2 border rounded-lg text-sm ${theme === 'light' ? 'border-gray-200 bg-white text-gray-800' : 'border-gray-600 bg-gray-600 text-white'}`}
                  />
                </div>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className={`w-full p-3 border rounded-lg mt-2 text-sm ${theme === 'light' ? 'border-gray-200 bg-white text-gray-800' : 'border-gray-600 bg-gray-600 text-white'}`}
                  placeholder="Leave a review (optional)"
                  rows="3"
                />
                <button onClick={submitRatingAndReview} className={`w-full py-2 mt-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-customGreen text-white hover:bg-customGreen' : 'bg-customGreen text-white hover:bg-customGreen'}`}>Submit Rating</button>
              </div>
            )}
          </form>
        </div>

        {/* Map Section */}
        <div className="lg:w-2/3 w-full h-96 lg:h-auto rounded-2xl shadow-lg overflow-hidden">
          {currentLocation ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={mapUrl}
            />
          ) : (
            <div className={`h-full rounded-2xl flex items-center justify-center ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-600'}`}>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Fetching your location...</p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Ride;