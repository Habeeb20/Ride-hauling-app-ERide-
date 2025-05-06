import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSun, FaMoon, FaEye, FaTimes, FaRoute, FaPhone, FaCar } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

function AvailableRidesOrder() {
  const [rideOffers, setRideOffers] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideModal, setShowRideModal] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [offerError, setOfferError] = useState(false);
  const [rideStarted, setRideStarted] = useState(false);
  const [rideProgress, setRideProgress] = useState(0);
  const [rideStatus, setRideStatus] = useState('');
  const [passengerDetails, setPassengerDetails] = useState(null);
  const [eta, setEta] = useState(null);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [rideHistory, setRideHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRideId, setCurrentRideId] = useState(null);
  const [driver, setDriver] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [theme, setTheme] = useState('light');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showFeatures, setShowFeatures] = useState({ economy: false, premium: false, shared: false });
  const [acceptedRideId, setAcceptedRideId] = useState(null);

  const embedApiKey = import.meta.env.VITE_EMBED_API_KEY;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const socket = io(import.meta.env.VITE_BACKEND_URL, {
    auth: { token, userId: driverId },
    autoConnect: false,
  });

  const navItems = [
    ...(rideStarted ? [{ id: 'city', label: 'Track Ride', icon: FaRoute, onClick: () => navigate(`/ride-tracking/${currentRideId}`) }] : []),
  ];

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          try {
            await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/rides/update-driver-location`,
              { lat: latitude, lng: longitude },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (error) {
            console.error('Error updating driver location:', error);
          }
        },
        (error) => {
          console.error("Location access denied:", error.message);
          toast.error('Location access required to view ride offers', { style: { background: '#F44336', color: 'white' } });
        }
      );
    }
  }, [token]);

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!token) {
        toast.error('Please log in to access the dashboard', { style: { background: '#F44336', color: 'white' } });
        navigate('/dlogin');
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.status) {
          setData(response.data.profile);
          setDriverId(response.data.profile?._id);
          setDriver(response.data.profile);
          if (response.data.profile.userId?.role !== 'driver') {
            toast.error('Only drivers can view ride offers', { style: { background: '#F44336', color: 'white' } });
            navigate('/driverdashboard');
            return;
          }
          toast.success('View available ride offers', { style: { background: '#4CAF50', color: 'white' } });
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'An error occurred';
        toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyProfile();
  }, [navigate, token]);

  useEffect(() => {
    const fetchRideOffers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rides/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRideOffers(response.data);
        console.log(response.data, "available rides");
      } catch (error) {
        console.error('Error fetching ride offers:', error);
        toast.error('Failed to fetch ride offers', { style: { background: '#F44336', color: 'white' } });
      }
    };
    fetchRideOffers();
  }, [token]);

  useEffect(() => {
    if (!token || !driverId) return;

    socket.connect();

    socket.on('newRideRequest', (rideData) => {
      setRideOffers((prev) => [...prev, rideData]);
      toast.info(`New ride request from ${rideData.client.firstName}`, {
        style: { background: '#2196F3', color: 'white' }
      });
    });

    socket.on('rideAccepted', ({ rideId, passenger }) => {
      setPassengerDetails({
        name: passenger.firstName,
        phoneNumber: passenger.phoneNumber,
        profilePicture: passenger.profilePicture,
        distance: passenger.distance || 'Calculating...',
      });
      setRideStarted(true);
      setEta(passenger.eta || '5 minutes');
      setCurrentRideId(rideId);
      setAcceptedRideId(rideId);
      setRideOffers([]);
      toast.success(`Ride accepted by ${passenger.firstName}`, {
        style: { background: '#4CAF50', color: 'white' }
      });
    });

    socket.on('driverRejected', ({ rideId }) => {
      setRideOffers((prev) => prev.filter((ride) => ride._id !== rideId));
      setShowRideModal(false);
      setSelectedRide(null);
      toast.info('Your offer was rejected', {
        style: { background: '#2196F3', color: 'white' }
      });
    });

    socket.on('rideCancelled', ({ rideId, cancelledBy, reason }) => {
      setRideOffers((prev) => prev.filter((ride) => ride._id !== rideId));
      setRideStarted(false);
      setPassengerDetails(null);
      setCurrentRideId(null);
      setAcceptedRideId(null);
      setRideProgress(0);
      setRideStatus('');
      toast.info(`Ride cancelled by ${cancelledBy}: ${reason}`, {
        style: { background: '#2196F3', color: 'white' }
      });
    });

    socket.on('newMessage', ({ rideId, sender, text, timestamp }) => {
      if (rideId === currentRideId) {
        setChatMessages((prev) => [...prev, { sender: sender._id, text, timestamp }]);
      }
    });

    socket.on('clientResponse', ({ rideId, clientId, response, offeredPrice }) => {
      setRideOffers((prev) =>
        prev.map((ride) =>
          ride._id === rideId
            ? {
                ...ride,
                driverOffers: [
                  ...(ride.driverOffers || []),
                  {
                    driver: driverId,
                    status: response === 'accepted' ? 'accepted' : 'rejected',
                    offeredPrice: response === 'accepted' ? offeredPrice : null,
                  },
                ],
              }
            : ride
        )
      );
      if (response === 'accepted') {
        toast.success('Your offer was accepted by the client!', {
          style: { background: '#4CAF50', color: 'white' },
        });
        setRideStarted(true);
        setCurrentRideId(rideId);
        setAcceptedRideId(rideId);
        setPassengerDetails({
          name: rideOffers.find((r) => r._id === rideId)?.client.firstName,
          phoneNumber: rideOffers.find((r) => r._id === rideId)?.client.phoneNumber,
          profilePicture: rideOffers.find((r) => r._id === rideId)?.client.profilePicture,
          distance: rideOffers.find((r) => r._id === rideId)?.distance,
        });
      } else {
        toast.info('Your offer was rejected by the client.', {
          style: { background: '#2196F3', color: 'white' },
        });
      }
    });

    socket.on('rideConfirmed', ({ driver, rideId }) => {
      if (driver._id === driverId) {
        setAcceptedRideId(rideId);
        toast.success('Your ride offer has been accepted!', {
          style: { background: '#4CAF50', color: 'white' },
        });
        navigate(`/ride-tracking/${rideId}`);
      }
    });

    return () => socket.disconnect();
  }, [token, driverId, currentRideId, rideOffers, navigate]);

  useEffect(() => {
    if (!rideStarted || !currentRideId) return;
    const interval = setInterval(() => {
      setRideProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const newProgress = prev + 2;
        if (newProgress < 50) setRideStatus('On the way to passenger');
        else if (newProgress === 50) setRideStatus('Passenger picked up');
        else setRideStatus('Ride in progress');
        return newProgress;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [rideStarted, currentRideId]);

  useEffect(() => {
    if (!driverId) return;
    const fetchRideHistory = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rides/driverhistory`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRideHistory(response.data.rides || []);
      } catch (error) {
        console.error('Error fetching ride history:', error);
        toast.error('Failed to fetch ride history', { style: { background: '#F44336', color: 'white' } });
      }
    };
    fetchRideHistory();
  }, [rideStatus, driverId, token]);

  const hasDriverActed = (ride) => {
    return ride.driverOffers?.some((offer) => offer.driver === driverId);
  };

  const getDriverAction = (ride) => {
    const offer = ride.driverOffers?.find((offer) => offer.driver === driverId);
    return offer ? offer.status : null;
  };

  const handleOfferRide = async (rideId) => {
    if (!offeredPrice || isNaN(offeredPrice) || offeredPrice <= 0) {
      setOfferError(true);
      toast.error('Please enter a valid offered price', { style: { background: '#F44336', color: 'white' } });
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}/offer`,
        { offeredPrice, action: 'negotiated' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRideOffers((prev) =>
        prev.map((ride) =>
          ride._id === rideId
            ? {
                ...ride,
                driverOffers: [
                  ...(ride.driverOffers || []),
                  { driver: driverId, status: 'pending', offeredPrice: parseFloat(offeredPrice) },
                ],
              }
            : ride
        )
      );
      toast.success('Offer submitted successfully', { style: { background: '#4CAF50', color: 'white' } });
      setOfferedPrice('');
      setOfferError(false);
      setShowRideModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to submit offer';
      toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}/offer`,
        { offeredPrice: selectedRide.calculatedPrice, action: 'accepted' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRideOffers((prev) =>
        prev.map((ride) =>
          ride._id === rideId
            ? {
                ...ride,
                driverOffers: [
                  ...(ride.driverOffers || []),
                  { driver: driverId, status: 'pending', offeredPrice: selectedRide.calculatedPrice },
                ],
              }
            : ride
        )
      );
      toast.success('Ride accepted successfully', { style: { background: '#4CAF50', color: 'white' } });
      setShowRideModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to accept ride';
      toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRide = async (rideId) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRideOffers((prev) =>
        prev.map((ride) =>
          ride._id === rideId
            ? {
                ...ride,
                driverOffers: [
                  ...(ride.driverOffers || []),
                  { driver: driverId, status: 'rejected', offeredPrice: null },
                ],
              }
            : ride
        )
      );
      toast.success('Ride rejected successfully', { style: { background: '#4CAF50', color: 'white' } });
      setShowRideModal(false);
      setSelectedRide(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to reject ride';
      toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${currentRideId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRideStatus('Ride started');
      toast.success('Ride started', { style: { background: '#4CAF50', color: 'white' } });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to start ride';
      toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${currentRideId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRideProgress(100);
      setRideStatus('Ride completed');
      setRideStarted(false);
      setPaymentReceived(true);
      toast.success('Ride completed successfully', { style: { background: '#4CAF50', color: 'white' } });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to complete ride';
      toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${currentRideId}/cancel`,
        { reason: "Driver cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRideStarted(false);
      setPassengerDetails(null);
      setCurrentRideId(null);
      setAcceptedRideId(null);
      setRideProgress(0);
      setRideStatus('');
      toast.success('Ride cancelled successfully', { style: { background: '#4CAF50', color: 'white' } });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel ride';
      toast.error(errorMessage, { style: { background: '#F44336', color: 'white' } });
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !rideStarted) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rides/${currentRideId}/chat`,
        { text: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatMessages([...chatMessages, { sender: driverId, text: newMessage }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending chat message:', error);
      toast.error('Failed to send message', { style: { background: '#F44336', color: 'white' } });
    }
  };

  const mapUrl = selectedRide
    ? `https://www.google.com/maps/embed/v1/directions?key=${embedApiKey}&origin=${encodeURIComponent(currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : 'Current Location')}&destination=${encodeURIComponent(selectedRide.pickupAddress)}&mode=driving`
    : `https://www.google.com/maps/embed/v1/view?key=${embedApiKey}&center=${currentLocation?.lat || 0},${currentLocation?.lng || 0}&zoom=15`;

  const toggleFeatures = (option) => setShowFeatures((prev) => ({ ...prev, [option]: !prev[option] }));

  return (
    <div className={`font-sans flex flex-col min-h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between p-4 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-gray-700'}`}>
        <div className="flex items-center space-x-3">
          <h1 className={`text-lg font-semibold ${theme === 'light' ? 'text-customGreen' : 'text-white'}`}>Ride Offers</h1>
          <button onClick={toggleTheme} className={`${theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-white'}`}>
            {theme === 'light' ? <FaMoon size={20} /> : <FaSun size={20} />}
          </button>
        </div>
        <button onClick={() => setShowProfile(!showProfile)}>
          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden shadow-sm">
            {driver?.profilePicture && <img src={driver.profilePicture} alt="Profile" className="w-full h-full object-cover" />}
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
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Name: {driver?.userId?.firstName || 'Driver'}</p>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Email: {driver?.userId?.email || 'driver@example.com'}</p>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Phone: {driver?.phoneNumber}</p>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Location: {driver?.location?.state}, {driver?.location?.lga}</p>
            {driver?.carDetails && (
              <>
                <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Car: {driver.carDetails.model} ({driver.carDetails.year})</p>
                <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>License Plate: {driver.carDetails.plateNumber}</p>
              </>
            )}
            <h3 className={`text-sm font-semibold mt-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Ride History</h3>
            {rideHistory.length > 0 ? (
              <ul className="space-y-2 mt-2">
                {rideHistory.map((ride, index) => (
                  <li key={index} className={`border p-3 rounded-lg ${theme === 'light' ? 'border-gray-200' : 'border-gray-600'}`}>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>From: {ride.pickupAddress}</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>To: {ride.destinationAddress}</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Distance: {ride.distance} km</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Price: ₦{ride.finalPrice || ride.calculatedPrice}</p>
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

      {/* Ride Details Modal */}
      {showRideModal && selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 w-11/12 max-w-md ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-gray-700'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Ride Offer Details</h2>
              <button onClick={() => setShowRideModal(false)} className={`${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 hover:text-white'}`}>
                <FaTimes size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-customGreen">
                  <img
                    src={selectedRide.client.profilePicture || "https://via.placeholder.com/150"}
                    alt={`${selectedRide.client.firstName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedRide.client.firstName} {selectedRide.client.lastName}</p>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Email: {selectedRide.client.email}</p>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Phone: {selectedRide.client.phoneNumber || 'N/A'}</p>
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-2 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                <p>Pickup:</p>
                <p className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedRide.pickupAddress}</p>
                <p>Destination:</p>
                <p className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedRide.destinationAddress}</p>
                <p>Distance:</p>
                <p className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedRide.distance} km</p>
                <p>Passengers:</p>
                <p className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedRide.passengerNum || 1}</p>
                <p>Ride Option:</p>
                <p className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedRide.rideOption}</p>
                <p>Payment Method:</p>
                <p className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedRide.paymentMethod}</p>
                <p>Contact:</p>
                <p>
                  <a
                    href={`tel:${selectedRide.client.phoneNumber}`}
                    className={`${theme === 'light' ? 'text-customGreen hover:text-customGreen' : 'text-GreenColor hover:text-GreenColor'} font-medium flex items-center`}
                  >
                    <FaPhone className="mr-1" /> {selectedRide.client.phoneNumber || 'N/A'}
                  </a>
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-600'}`}>
                <h3 className={`text-sm font-semibold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Price Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>System Calculated:</span>
                    <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{selectedRide.calculatedPrice}</span>
                  </div>
                  {selectedRide.desiredPrice && (
                    <div className="flex justify-between">
                      <span>Passenger's Offer:</span>
                      <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{selectedRide.desiredPrice}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Your Offer:</span>
                    <input
                      type="number"
                      value={offeredPrice}
                      onChange={(e) => {
                        setOfferedPrice(e.target.value);
                        setOfferError(false);
                      }}
                      className={`w-20 p-1 border rounded text-sm ${
                        theme === 'light'
                          ? `border-gray-200 bg-white text-gray-800 ${offerError ? 'border-red-500' : ''}`
                          : `border-gray-600 bg-gray-600 text-white ${offerError ? 'border-red-500' : ''}`
                      }`}
                      placeholder="₦"
                      disabled={hasDriverActed(selectedRide)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAcceptRide(selectedRide._id)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    theme === 'light' ? 'bg-customGreen text-white hover:bg-customGreen' : 'bg-customGreen text-white hover:bg-customGreen'
                  } ${hasDriverActed(selectedRide) || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={hasDriverActed(selectedRide) || loading}
                >
                  {loading ? 'Processing...' : 'Accept Ride'}
                </button>
                <button
                  onClick={() => handleRejectRide(selectedRide._id)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    theme === 'light' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
                  } ${hasDriverActed(selectedRide) || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={hasDriverActed(selectedRide) || loading}
                >
                  {loading ? 'Processing...' : 'Reject Ride'}
                </button>
                <button
                  onClick={() => handleOfferRide(selectedRide._id)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    theme === 'light' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                  } ${hasDriverActed(selectedRide) || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={hasDriverActed(selectedRide) || loading}
                >
                  {loading ? 'Processing...' : 'Negotiate Price'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-4 md:gap-6">
        {/* Ride Offers Section */}
        <div className={`lg:w-1/3 w-full rounded-2xl shadow-lg p-4 md:p-6 ${theme === 'light' ? 'bg-white' : 'bg-gray-900'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Available Ride Offers</h3>
          {/* Statistics Grid Box */}
          <div className={`grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-600'}`}>
            <div className="text-center">
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Total Pending Rides</p>
              <p className={`text-2xl font-semibold ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'}`}>{rideOffers.length}</p>
            </div>
            <div className="text-center">
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Nearby Rides (≤10km)</p>
              <p className={`text-2xl font-semibold ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'}`}>{rideOffers.filter(ride => ride.distance <= 10).length}</p>
            </div>
          </div>
          {rideOffers.length > 0 ? (
            <ul className="space-y-3">
              {rideOffers.map((ride) => (
                <li
                  key={ride._id}
                  className={`p-4 rounded-lg shadow-sm ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-600 border border-gray-500'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-customGreen">
                        <img
                          src={ride.client?.profilePicture || "https://via.placeholder.com/150"}
                          alt={ride.client?.firstName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                          {ride.client?.firstName}
                        </p>
                        <p className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                          Distance: {ride.distance} km
                        </p>
                        {hasDriverActed(ride) && (
                          <p className={`text-xs font-semibold ${
                            getDriverAction(ride) === 'accepted' ? 'text-green-500' :
                            getDriverAction(ride) === 'rejected' ? 'text-red-500' :
                            'text-blue-500'
                          }`}>
                            {getDriverAction(ride) === 'accepted' ? 'Accepted' :
                             getDriverAction(ride) === 'rejected' ? 'Rejected' :
                             `Negotiated (₦${ride.driverOffers.find((offer) => offer.driver === driverId)?.offeredPrice})`}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRide(ride);
                        setOfferedPrice('');
                        setShowRideModal(true);
                      }}
                      className={`text-sm px-3 py-1 rounded-full ${theme === 'light' ? 'bg-GreenColor text-customGreen' : 'bg-GreenColor text-GreenColor'} hover:bg-GreenColor transition-colors flex items-center`}
                    >
                      <FaEye className="mr-1" /> Details
                    </button>
                  </div>
                  <div className={`mt-3 p-3 rounded-lg text-sm ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-500'}`}>
                    <div className="flex justify-between">
                      <span>System Price:</span>
                      <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{ride.calculatedPrice}</span>
                    </div>
                    {ride.desiredPrice && (
                      <div className="flex justify-between">
                        <span>Passenger's Offer:</span>
                        <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{ride.desiredPrice}</span>
                      </div>
                    )}
                    <div className="flex justify-between mt-1 pt-1 border-t border-gray-200">
                      <span className="font-medium">Ride Option:</span>
                      <span className={`font-semibold ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'}`}>
                        {ride.rideOption}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`p-4 text-center text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              No ride offers available
            </p>
          )}

          {rideStarted && passengerDetails && (
            <div className={`border-t pt-4 mt-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              <h4 className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Passenger Details</h4>
              <div className="flex items-center space-x-3 mt-2">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-customGreen">
                  <img
                    src={passengerDetails?.profilePicture || "https://via.placeholder.com/150"}
                    alt={passengerDetails.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Name: {passengerDetails.name}</p>
                  <p className="text-xs">Phone: {passengerDetails.phoneNumber}</p>
                  <p className="text-xs">Distance: {passengerDetails.distance}</p>
                  <p className="text-xs">ETA: {eta}</p>
                </div>
              </div>
              <div className={`mt-3 p-3 rounded-lg text-sm ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-500'}`}>
                <h5 className={`font-semibold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Price Information</h5>
                <p>Calculated Price: <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{selectedRide?.calculatedPrice || 'N/A'}</span></p>
                {selectedRide?.desiredPrice && (
                  <p>Passenger's Offer: <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>₦{selectedRide.desiredPrice}</span></p>
                )}
                <p className="mt-2">
                  Final Price: <span className={`font-semibold ${theme === 'light' ? 'text-customGreen' : 'text-GreenColor'}`}>
                    ₦{selectedRide?.finalPrice || selectedRide?.desiredPrice || selectedRide?.calculatedPrice}
                  </span>
                </p>
              </div>
              {!rideStatus.includes('Ride started') && (
                <button
                  onClick={handleStartRide}
                  className={`w-full py-2 mt-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-customGreen text-white hover:bg-customGreen' : 'bg-customGreen text-white hover:bg-customGreen'}`}
                  disabled={loading}
                >
                  {loading ? 'Starting...' : 'Start Ride'}
                </button>
              )}
              {rideStatus.includes('Ride started') && !rideStatus.includes('Ride completed') && (
                <button
                  onClick={handleCompleteRide}
                  className={`w-full py-2 mt-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-customGreen text-white hover:bg-customGreen' : 'bg-customGreen text-white hover:bg-customGreen'}`}
                  disabled={loading}
                >
                  {loading ? 'Completing...' : 'Complete Ride'}
                </button>
              )}
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
              <h4 className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Chat with Passenger</h4>
              <div className={`border p-3 rounded-lg h-24 overflow-y-auto text-sm ${theme === 'light' ? 'border-gray-200' : 'border-gray-500'}`}>
                {chatMessages.map((msg, index) => (
                  <p key={index} className={msg.sender === driverId ? 'text-right text-customGreen' : `text-left ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                    {msg.sender === driverId ? 'You' : 'Passenger'}: {msg.text}
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

          {paymentReceived && (
            <div className="mt-4">
              <h4 className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Payment Received</h4>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Payment of ₦{selectedRide?.finalPrice || selectedRide?.calculatedPrice} received.</p>
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="lg:w-2/3 w-full h-96 lg:h-auto rounded-2xl shadow-lg overflow-hidden relative">
          {currentLocation ? (
            <>
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={mapUrl}
              />
              {selectedRide && (
                <div className={`absolute top-4 left-4 p-3 rounded-lg ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-700 text-white'} shadow-md`}>
                  <p className="text-sm font-semibold">Selected Ride Distance</p>
                  <p className="text-lg">{selectedRide.distance} km</p>
                </div>
              )}
            </>
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

export default AvailableRidesOrder;