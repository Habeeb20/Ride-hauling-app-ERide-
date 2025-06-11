import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BookingModal = ({ vehicleType, onClose }) => {
  const [formData, setFormData] = useState({
    carInsured: false,
    typeOfCar: vehicleType,
    accommodationAvailable: false,
    startDate: "",
    startTime: "",
    endDate: "",
    employmentType: "",
    tripType: "",
    withinState: { state: "", pickupAddress: "", destinationAddress: "", tripOption: "" },
    interstate: {
      pickupState: "",
      pickupAddress: "",
      destinationState: "",
      destinationAddress: "",
      pickupTime: "",
      pickupDate: "",
      amount: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("withinState") || name.includes("interstate")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: type === "checkbox" ? checked : value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const user = userResponse.data.user;
      const data = {
        userId,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phoneNumber: user.phoneNumber,
        vehicleType,
        ...formData,
      };
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/bookings/create`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${vehicleType} booking submitted successfully`);
      onClose();
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error(error.response?.data?.message || "Failed to submit booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full mx-4 my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Book {vehicleType === "bus" ? "Bus Travel" : "Car Charter"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="carInsured"
              checked={formData.carInsured}
              onChange={handleChange}
            />
            Car Insured
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="accommodationAvailable"
              checked={formData.accommodationAvailable}
              onChange={handleChange}
            />
            Accommodation Available
          </label>
          <div className="flex gap-4">
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <select
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Select Employment Type</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="temporary">Temporary</option>
            <option value="a trip">A Trip</option>
            <option value="permanent">Permanent</option>
          </select>
          {formData.employmentType === "a trip" && (
            <div className="space-y-4">
              <select
                name="tripType"
                value={formData.tripType}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Trip Type</option>
                <option value="withinState">Within State</option>
                <option value="interstate">Interstate</option>
              </select>
              {formData.tripType === "withinState" && (
                <div className="space-y-4">
                  <select
                    name="withinState.state"
                    value={formData.withinState.state}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="withinState.pickupAddress"
                    value={formData.withinState.pickupAddress}
                    onChange={handleChange}
                    placeholder="Pickup Address"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="text"
                    name="withinState.destinationAddress"
                    value={formData.withinState.destinationAddress}
                    onChange={handleChange}
                    placeholder="Destination Address"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <select
                    name="withinState.tripOption"
                    value={formData.withinState.tripOption}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Trip Option</option>
                    <option value="oneWay">Pickup to Destination</option>
                    <option value="roundTrip">Pickup to Destination and Back</option>
                  </select>
                </div>
              )}
              {formData.tripType === "interstate" && (
                <div className="space-y-4">
                  <select
                    name="interstate.pickupState"
                    value={formData.interstate.pickupState}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Pickup State</option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="interstate.pickupAddress"
                    value={formData.interstate.pickupAddress}
                    onChange={handleChange}
                    placeholder="Pickup Address"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <select
                    name="interstate.destinationState"
                    value={formData.interstate.destinationState}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Destination State</option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="interstate.destinationAddress"
                    value={formData.interstate.destinationAddress}
                    onChange={handleChange}
                    placeholder="Destination Address"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="date"
                    name="interstate.pickupDate"
                    value={formData.interstate.pickupDate}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="time"
                    name="interstate.pickupTime"
                    value={formData.interstate.pickupTime}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="number"
                    name="interstate.amount"
                    value={formData.interstate.amount}
                    onChange={handleChange}
                    placeholder="Amount to Pay (₦)"
                    min="0"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-customPink text-white rounded-lg hover:bg-activeColor ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;