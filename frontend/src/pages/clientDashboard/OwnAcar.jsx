import React, { useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
  FaBell,
  FaSearch,
  FaCar,
  FaPlane,
  FaTruck,
  FaBus,
  FaTrailer,
  FaSuitcase,
  FaUser,
  FaRoute,
  FaCog,
  FaBars,
  FaEdit,
  FaSave,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaShieldAlt,
  FaCalendar,
  FaCalendarCheck
} from "react-icons/fa";
import { toast } from 'sonner';
import axios from 'axios';
import { useState } from 'react';

const OwnAcar = () => {
  const [carForm, setCarForm] = useState({
    carDetails: { model: "", product: "", year: "", color: "", plateNumber: "" },
    picture: "",
    carPicture: "",
    driverLicense: "",
  });
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDriverSchedule, setSelectedDriverSchedule] = useState(null);
  const [allSchedules, setAllSchedules] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    time: "",
    date: "",
    state: "",
    lga: "",
    pickUp: "",
    address: "",
    priceRange: { min: "", max: "" },
    description: "",
  });

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "essential");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dc0poqt9l/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  };

  // Fetch car profile
  const fetchCarProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ownacar/getmyCarProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("fetchCarProfile response:", response.data); // Debug log
      if (response.data.status && response.data.data) {
        setCarData(response.data.data);
      } else {
        setCarData(null);
      }
    } catch (error) {
      console.error("Error fetching car profile:", error.response?.data || error.message);
      setCarData(null);
    }
  };

  // Handle car registration form submission with Cloudinary uploads
  const handleCarSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const pictureUrl = carForm.picture ? await uploadToCloudinary(carForm.picture) : null;
      const carPictureUrl = carForm.carPicture ? await uploadToCloudinary(carForm.carPicture) : null;
      const driverLicenseUrl = carForm.driverLicense ? await uploadToCloudinary(carForm.driverLicense) : null;

      const carDataToSend = {
        carDetails: carForm.carDetails,
        picture: pictureUrl,
        carPicture: carPictureUrl,
        driverLicense: driverLicenseUrl,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ownacar/registeryourcar`,
        carDataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("handleCarSubmit response:", response.data); // Debug log
      if (response.data.status) {
        toast.success("Car registered successfully", { style: { background: "#4CAF50", color: "white" } });
        await fetchCarProfile(); // Ensure carData is updated
        setCarForm({
          carDetails: { model: "", product: "", year: "", color: "", plateNumber: "" },
          picture: null,
          carPicture: null,
          driverLicense: null,
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to register car";
      console.error("handleCarSubmit error:", error.response?.data || error.message); // Debug log
      toast.error(errorMessage, { style: { background: "#F44336", color: "white" } });
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules
  const fetchMySchedules = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/getmyschedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("fetchMySchedules response:", response.data); // Debug log
      if (response.data.status) {
        setSchedules(response.data.schedules);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error.response?.data || error.message);
      setSchedules([]);
      toast.error("Failed to fetch schedules", { style: { background: "#F44336", color: "white" } });
    }
  };

  // Handle schedule form submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/schedule/postschedule`,
        scheduleForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("handleScheduleSubmit response:", response.data); // Debug log
      if (response.data.status) {
        toast.success("Schedule posted successfully", { style: { background: "#4CAF50", color: "white" } });
        await fetchMySchedules();
        setScheduleForm({
          time: "",
          date: "",
          state: "",
          lga: "",
          pickUp: "",
          address: "",
          priceRange: { min: "", max: "" },
          description: "",
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to post schedule";
      console.error("handleScheduleSubmit error:", error.response?.data || error.message); // Debug log
      toast.error(errorMessage, { style: { background: "#F44336", color: "white" } });
    } finally {
      setLoading(false);
    }
  };

  // Fetch car profile on component mount
  useEffect(() => {
    fetchCarProfile();
    fetchMySchedules(); // Also fetch schedules on mount
  }, []);

  return (
    <div>
      <div className="">
        <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaCar className="mr-2 text-customGreen" /> Own a Car?
          </h3>
          {carData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-gray-700">
                <p className="flex items-center">
                  <FaCar className="mr-2 text-customGreen" /> <strong className="font-semibold">Model:</strong>
                  <span className="ml-2">{carData.carDetails.model}</span>
                </p>
                <p className="flex items-center">
                  <FaCar className="mr-2 text-customGreen" /> <strong className="font-semibold">Product:</strong>
                  <span className="ml-2">{carData.carDetails.product}</span>
                </p>
                <p className="flex items-center">
                  <FaCar className="mr-2 text-customGreen" /> <strong className="font-semibold">Year:</strong>
                  <span className="ml-2">{carData.carDetails.year}</span>
                </p>
                <p className="flex items-center">
                  <FaCar className="mr-2 text-customGreen" /> <strong className="font-semibold">Color:</strong>
                  <span className="ml-2">{carData.carDetails.color}</span>
                </p>
                <p className="flex items-center">
                  <FaCar className="mr-2 text-customGreen" /> <strong className="font-semibold">Plate Number:</strong>
                  <span className="ml-2">{carData.carDetails.plateNumber}</span>
                </p>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="flex items-center">
                  <FaUser className="mr-2 text-customGreen" /> <strong className="font-semibold">Picture:</strong>
                  <a
                    href={carData.picture}
                    target="_blank"
                    className="ml-2 text-blue-500 hover:underline hover:text-blue-700 transition-colors"
                  >
                    View
                  </a>
                </p>
                <p className="flex items-center">
                  <FaCar className="mr-2 text-customGreen" /> <strong className="font-semibold">Car Picture:</strong>
                  <a
                    href={carData.carPicture}
                    target="_blank"
                    className="ml-2 text-blue-500 hover:underline hover:text-blue-700 transition-colors"
                  >
                    View
                  </a>
                </p>
                <p className="flex items-center">
                  <FaShieldAlt className="mr-2 text-customGreen" /> <strong className="font-semibold">Driver License:</strong>
                  <a
                    href={carData.driverLicense}
                    target="_blank"
                    className="ml-2 text-blue-500 hover:underline hover:text-blue-700 transition-colors"
                  >
                    View
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCarSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    value={carForm.carDetails.model}
                    onChange={(e) =>
                      setCarForm({ ...carForm, carDetails: { ...carForm.carDetails, model: e.target.value } })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <input
                    type="text"
                    value={carForm.carDetails.product}
                    onChange={(e) =>
                      setCarForm({ ...carForm, carDetails: { ...carForm.carDetails, product: e.target.value } })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="text"
                    value={carForm.carDetails.year}
                    onChange={(e) =>
                      setCarForm({ ...carForm, carDetails: { ...carForm.carDetails, year: e.target.value } })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <input
                    type="text"
                    value={carForm.carDetails.color}
                    onChange={(e) =>
                      setCarForm({ ...carForm, carDetails: { ...carForm.carDetails, color: e.target.value } })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Plate Number</label>
                  <input
                    type="text"
                    value={carForm.carDetails.plateNumber}
                    onChange={(e) =>
                      setCarForm({ ...carForm, carDetails: { ...carForm.carDetails, plateNumber: e.target.value } })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCarForm({ ...carForm, picture: e.target.files[0] })}
                    className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-customGreen file:text-white hover:file:bg-green-700 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Car Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCarForm({ ...carForm, carPicture: e.target.files[0] })}
                    className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-customGreen file:text-white hover:file:bg-green-700 transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Driver License</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCarForm({ ...carForm, driverLicense: e.target.files[0] })}
                    className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-customGreen file:text-white hover:file:bg-green-700 transition-all"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-customGreen text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Uploading..." : "Register Car"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnAcar;