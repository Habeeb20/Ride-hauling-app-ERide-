import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
const RentalModal = ({ vehicleType, onClose }) => {
  const [formData, setFormData] = useState({
    startDate: "",
    startTime: "",
    returnDate: "",
    returnTime: "",
    idCard: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "id_cards");
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload ID card");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userResponse = await axios.get(
         `${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const user = userResponse.data.user;
      let idCardUrl = null;
      if (formData.idCard) {
        idCardUrl = await uploadToCloudinary(formData.idCard);
      }
      const data = {
        userId,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phoneNumber: user.phoneNumber,
        vehicleType,
        startDate: formData.startDate,
        startTime: formData.startTime,
        returnDate: formData.returnDate,
        returnTime: formData.returnTime,
        idCardUrl,
        price: calculatePrice(),
      };
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rentals/request`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${vehicleType} rental request submitted successfully`);
      onClose();
    } catch (error) {
      console.error("Error submitting rental:", error);
      toast.error(error.message || error.response?.data?.message || "Failed to submit rental");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.returnDate}T${formData.returnTime}`);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const rates = { lorry: 50000, van: 40000, trailer: 80000 };
    return (days * rates[vehicleType]).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Rent {vehicleType}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Time</label>
            <input
              type="time"
              name="returnTime"
              value={formData.returnTime}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Card</label>
            <input
              type="file"
              name="idCard"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg"
              required
            />
          </div>
          {formData.startDate && formData.returnDate && (
            <p><strong>Estimated Price:</strong> ₦{calculatePrice()}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-700 min-h-[48px] z-10 relative ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit Rental Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RentalModal;