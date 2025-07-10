import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaWhatsapp, FaPhone, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ErrandersDisplay = ({ isDarkTheme }) => {
  const [erranders, setErranders] = useState([]);
  const [filteredErranders, setFilteredErranders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [lgaFilter, setLgaFilter] = useState('');
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Changed to false
  const [selectedErrander, setSelectedErrander] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    pickupAddress: '',
    destination: '',
    itemName: '',
    offeredPrice: '',
    itemPicture: null,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Nigerian states and LGAs
  const nigeriaData = {
    Lagos: ['Ikeja', 'Lagos Island', 'Surulere'],
    Abuja: ['Abuja Municipal', 'Gwagwalada'],
    Oyo: ['Ibadan North', 'Ibadan South'],
  };

  useEffect(() => {
    setStates(Object.keys(nigeriaData));
  }, []);

  useEffect(() => {
    if (stateFilter) {
      setLgas(nigeriaData[stateFilter] || []);
      setLgaFilter('');
    } else {
      setLgas([]);
      setLgaFilter('');
    }
  }, [stateFilter]);

  // Fetch erranders
  useEffect(() => {
    const fetchErranders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/erranders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Robust response handling
        let errandersData = response.data;
        if (!Array.isArray(errandersData)) {
          errandersData = errandersData?.data || errandersData?.erranders || [];
        }

        // Validate errander objects
        const validErranders = errandersData.filter(
          (errander) => errander && typeof errander === 'object' && errander._id
        );

        setErranders(validErranders);
        setFilteredErranders(validErranders);
        setLoading(false);
      } catch (err) {
        console.error('Fetch erranders error:', err);
        const errorMsg = err.response?.data?.message || 'Failed to fetch erranders';
        setError(errorMsg);
        setLoading(false);
        toast.error(errorMsg);
      }
    };
    fetchErranders();
  }, []);

  // Filter erranders
  useEffect(() => {
    let filtered = erranders;
    if (stateFilter) {
      filtered = filtered.filter((errander) =>
        errander.state?.toLowerCase() === stateFilter.toLowerCase()
      );
    }
    if (lgaFilter) {
      filtered = filtered.filter((errander) =>
        errander.LGA?.toLowerCase() === lgaFilter.toLowerCase()
      );
    }
    setFilteredErranders(filtered);
  }, [stateFilter, lgaFilter, erranders]);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!bookingForm.pickupAddress.trim()) errors.pickupAddress = 'Pickup address is required';
    if (!bookingForm.destination.trim()) errors.destination = 'Destination is required';
    if (!bookingForm.itemName.trim()) errors.itemName = 'Item name is required';
    if (!bookingForm.offeredPrice || isNaN(parseFloat(bookingForm.offeredPrice))) {
      errors.offeredPrice = 'Valid price is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Cloudinary upload
  const uploadImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'erandapp');

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (err) {
      toast.error('Failed to upload image');
      return null;
    }
  };

  // Submit booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedErrander?._id) {
      toast.error('No errander selected');
      return;
    }

    setFormLoading(true);

    try {
      const imageUrl = await uploadImage(bookingForm.itemPicture);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/bookings`,
        {
          erranderId: selectedErrander._id,
          pickupAddress: bookingForm.pickupAddress,
          destination: bookingForm.destination,
          itemName: bookingForm.itemName,
          itemPicture: imageUrl,
          offeredPrice: parseFloat(bookingForm.offeredPrice),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Booking submitted successfully!');
      setIsModalOpen(false);
      setBookingForm({
        pickupAddress: '',
        destination: '',
        itemName: '',
        itemPicture: null,
        offeredPrice: '',
      });
      setFormErrors({});
      setSelectedErrander(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit booking';
      toast.error(errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const openBookingModal = (errander) => {
    setSelectedErrander(errander);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-6 ${isDarkTheme ? 'text-red-400' : 'text-red-500'}`}>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-green-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-6xl mx-auto ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <h1 className="text-3xl font-bold text-center mb-6">Available Erranders</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block font-medium mb-1">State</label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              isDarkTheme ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500' : 'border-gray-300 focus:ring-green-600'
            }`}
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">LGA</label>
          <select
            value={lgaFilter}
            onChange={(e) => setLgaFilter(e.target.value)}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              isDarkTheme ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500' : 'border-gray-300 focus:ring-green-600'
            }`}
            disabled={!stateFilter}
          >
            <option value="">All LGAs</option>
            {lgas.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredErranders.length === 0 ? (
          <p className="text-center text-gray-600 col-span-full">No erranders found</p>
        ) : (
          filteredErranders.map((errander) => (
            <div
              key={errander._id}
              className={`p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              }`}
            >
              <img
                src={errander.profilePicture || 'https://via.placeholder.com/150'}
                alt={errander.userEmail || 'Errander'}
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-center">
                {errander.userId?.firstName || errander.userEmail || 'Unknown'}
              </h2>
              <p className="text-center">{errander.state || 'N/A'}, {errander.LGA || 'N/A'}</p>
              <p className="text-center">Phone: {errander.phoneNumber || 'N/A'}</p>
              <p className="text-center">Jobs: {errander.jobsCanDo?.join(', ') || 'N/A'}</p>
              <div className="flex justify-center gap-4 mt-4">
                {errander.phoneNumber && (
                  <>
                    <a
                      href={`https://wa.me/${errander.phoneNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <FaWhatsapp className="mr-2" /> WhatsApp
                    </a>
                    <a
                      href={`tel:${errander.phoneNumber}`}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <FaPhone className="mr-2" /> Call
                    </a>
                  </>
                )}
                <button
                  onClick={() => openBookingModal(errander)}
                  className="flex items-center px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-green-600"
                >
                  <FaPaperPlane className="mr-2" /> Book
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setSelectedErrander(null);
        }}
        className={`p-6 rounded-lg shadow-xl max-w-lg mx-auto mt-20 ${
          isDarkTheme ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
        }`}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4">Book Errander</h2>
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Pickup Address</label>
            <input
              type="text"
              name="pickupAddress"
              value={bookingForm.pickupAddress}
              onChange={handleFormChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.pickupAddress
                  ? 'border-red-500 focus:ring-red-500'
                  : isDarkTheme
                  ? 'bg-gray-800 border-gray-600 text-white focus:ring-green-500'
                  : 'border-gray-300 focus:ring-green-600'
              }`}
            />
            {formErrors.pickupAddress && (
              <p className="text-red-500 text-sm">{formErrors.pickupAddress}</p>
            )}
          </div>
          <div>
            <label className="block font-medium">Destination</label>
            <input
              type="text"
              name="destination"
              value={bookingForm.destination}
              onChange={handleFormChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.destination
                  ? 'border-red-500 focus:ring-red-500'
                  : isDarkTheme
                  ? 'bg-gray-800 border-gray-600 text-white focus:ring-green-500'
                  : 'border-gray-300 focus:ring-green-600'
              }`}
            />
            {formErrors.destination && (
              <p className="text-red-500 text-sm">{formErrors.destination}</p>
            )}
          </div>
          <div>
            <label className="block font-medium">Item Name</label>
            <input
              type="text"
              name="itemName"
              value={bookingForm.itemName}
              onChange={handleFormChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.itemName
                  ? 'border-red-500 focus:ring-red-500'
                  : isDarkTheme
                  ? 'bg-gray-800 border-gray-600 text-white focus:ring-green-500'
                  : 'border-gray-300 focus:ring-green-600'
              }`}
            />
            {formErrors.itemName && (
              <p className="text-red-500 text-sm">{formErrors.itemName}</p>
            )}
          </div>
          <div>
            <label className="block font-medium">Item Picture (Optional)</label>
            <input
              type="file"
              name="itemPicture"
              accept="image/*"
              onChange={handleFormChange}
              className={`w-full p-3 border rounded-lg ${
                isDarkTheme ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block font-medium">Offered Price</label>
            <input
              type="number"
              name="offeredPrice"
              value={bookingForm.offeredPrice}
              onChange={handleFormChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.offeredPrice
                  ? 'border-red-500 focus:ring-red-500'
                  : isDarkTheme
                  ? 'bg-gray-800 border-gray-600 text-white focus:ring-green-500'
                  : 'border-gray-300 focus:ring-green-600'
              }`}
            />
            {formErrors.offeredPrice && (
              <p className="text-red-500 text-sm">{formErrors.offeredPrice}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={formLoading}
            className={`w-full p-3 rounded-lg text-white flex items-center justify-center ${
              formLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : isDarkTheme
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-[#4CAF50] hover:bg-green-600'
            }`}
          >
            {formLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Submitting...
              </>
            ) : (
              'Submit Booking'
            )}
          </button>
        </form>
        <button
          onClick={() => {
            setIsModalOpen(false);
            setSelectedErrander(null);
          }}
          className={`mt-4 w-full p-3 border rounded-lg ${
            isDarkTheme ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default ErrandersDisplay;