// src/components/DriverDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const WantToBeHired = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    durationType: "day",
    durationValue: "1",
    minSalary: "",
  });
  const [loading, setLoading] = useState(true);
  const [theme] = useState("light");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in again");
          navigate("/login");
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/profile/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsAvailable(res.data.availableToBeHired);
        if (res.data.availableToBeHiredDetails) {
          setFormData({
            durationType: res.data.availableToBeHiredDetails.durationType || "day",
            durationValue: res.data.availableToBeHiredDetails.durationValue?.toString() || "1",
            minSalary: res.data.availableToBeHiredDetails.minSalary?.toString() || "",
          });
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast.error(error.response?.data?.error || "Failed to fetch availability");
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [navigate]);

  const handleToggle = async (e) => {
    const value = e.target.checked;
    if (value) {
      setModalOpen(true);
    } else {
      await updateAvailability({ availableToBeHired: false });
    }
  };

  const updateAvailability = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile/availability`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAvailable(res.data.availableToBeHired);
      setFormData({
        durationType: res.data.availableToBeHiredDetails?.durationType || "day",
        durationValue: res.data.availableToBeHiredDetails?.durationValue?.toString() || "1",
        minSalary: res.data.availableToBeHiredDetails?.minSalary?.toString() || "",
      });
      toast.success(res.data.message);
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error(error.response?.data?.error || "Failed to update availability");
      if (data.availableToBeHired) {
        setIsAvailable(false); // Revert on error
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.durationType || !formData.minSalary) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      ["day", "days", "week", "weeks", "month", "months"].includes(formData.durationType) &&
      (!formData.durationValue || Number(formData.durationValue) < 1)
    ) {
      toast.error("Please enter a valid duration");
      return;
    }

    await updateAvailability({
      availableToBeHired: true,
      durationType: formData.durationType,
      durationValue: formData.durationValue ? Number(formData.durationValue) : null,
      minSalary: Number(formData.minSalary),
    });

    setModalOpen(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className={`min-h-screen p-6 ${theme === "light" ? "bg-gray-100" : "bg-gray-800"}`}>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Driver Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Availability Status</h2>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={handleToggle}
              disabled={loading}
              className="form-checkbox h-5 w-5 text-customGreen"
            />
            <span className="ml-2 text-gray-500">Available to be Hired</span>
          </label>
        </div>
        {isAvailable && (
          <p className="text-green-600 text-sm">
            Status: Available for {formData.durationType}
            {formData.durationValue ? ` (${formData.durationValue})` : ""}, Minimum Salary: ₦{formData.minSalary}
          </p>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${theme === "light" ? "bg-white" : "bg-gray-700"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Set Availability Details</h3>
              <button onClick={() => setModalOpen(false)}>
                <FaTimes size={20} className="text-gray-600 hover:text-gray-900" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration Type</label>
                <div className="flex flex-wrap gap-2">
                  {["day", "days", "week", "weeks", "month", "months", "permanent", "temporary"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, durationType: type })}
                      className={`px-3 py-1 rounded-lg border ${
                        formData.durationType === type
                          ? "bg-customGreen text-white border-customGreen"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {["day", "days", "week", "weeks", "month", "months"].includes(formData.durationType) && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration Value</label>
                  <input
                    type="number"
                    value={formData.durationValue}
                    onChange={(e) => setFormData({ ...formData, durationValue: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 2"
                    min="1"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary (₦)</label>
                <input
                  type="number"
                  value={formData.minSalary}
                  onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 50000"
                  min="0"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center py-2 rounded-lg font-semibold transition-colors ${
                  theme === "light" ? "bg-customGreen text-white hover:bg-green-700" : "bg-customGreen text-white hover:bg-green-700"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FaCheck size={20} className="mr-2" />
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WantToBeHired;