import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const [cloudinaryUrls, setCloudinaryUrls] = useState({});
  const cloudinaryWidgetRef = useRef();
  const [uploadType, setUploadType] = useState(""); // Track upload type

  const [formData, setFormData] = useState({
    userEmail: "",
    gender: "",
    location: { state: "", lga: "", address: "", coordinates: { lat: "", lng: "" } },
    phoneNumber: "",
    isDriver: false,
    question: "",
    schoolId: "",
    profilePicture: "",
    carDetails: { model: "", product: "", year: "", color: "", plateNumber: "" },
    carPicture: "",
    driverLicense: "",
    certificateTraining: "",
    maritalStatus: "",
    YOE: "",
    currentLocation: "",
    languageSpoken: "",
    gearType: "",
    vehicleType: "",
    driverRoles: [],
    interstate: false,
    availableToBeHiredDetails: {
      durationType: "",
      durationValue: "",
      minSalary: "",
      interstateTravel: false,
      typeOfCar: "",
      typeOfTransmission: "",
      choice: "",
      startDate: "",
      endDate: "",
      timeToStart: "",
    },
  });

  // Initialize Cloudinary Upload Widget
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      cloudinaryWidgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          folder: "ride-hauling",
          sources: ["local", "url", "camera"],
          multiple: false,
          maxFiles: 1,
          clientAllowedFormats: ["jpg", "png", "jpeg"],
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            setCloudinaryUrls((prev) => ({
              ...prev,
              [uploadType]: result.info.secure_url,
            }));
            setFormData((prev) => ({
              ...prev,
              [uploadType]: result.info.secure_url,
            }));
          }
        }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [uploadType]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found, please log in.");
        }
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setFormData({
          ...formData,
          ...res.data,
          location: {
            ...formData.location,
            ...res.data.location,
            coordinates: {
              ...formData.location.coordinates,
              ...res.data.location?.coordinates,
            },
          },
          carDetails: {
            ...formData.carDetails,
            ...res.data.carDetails,
          },
          availableToBeHiredDetails: {
            ...formData.availableToBeHiredDetails,
            ...res.data.availableToBeHiredDetails,
          },
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.userEmail || !/\S+@\S+\.\S+/.test(formData.userEmail)) {
      errors.userEmail = "Valid email is required";
    }
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.location.state) errors.state = "State is required";
    if (!formData.location.lga) errors.lga = "LGA is required";
    if (!formData.location.address) errors.address = "Address is required";
    if (!formData.phoneNumber || formData.phoneNumber.length !== 11) {
      errors.phoneNumber = "Phone number must be 11 digits";
    }
    if (formData.profilePicture && !formData.profilePicture.match(/^https:\/\/res\.cloudinary\.com\/.*$/)) {
      errors.profilePicture = "Invalid Cloudinary URL";
    }

    if (!formData.isDriver) {
      if (!formData.question) errors.question = "Please select student or passenger";
      if (formData.question === "student") {
        if (!formData.schoolId || !formData.schoolId.match(/^https:\/\/res\.cloudinary\.com\/.*$/)) {
          errors.schoolId = "Valid Cloudinary URL for School ID is required";
        }
      }
    }

    if (formData.isDriver) {
      if (!formData.carDetails.model) errors.model = "Car model is required";
      if (!formData.carDetails.product) errors.product = "Car product is required";
      if (!formData.carDetails.year) errors.year = "Car year is required";
      if (!formData.carDetails.color) errors.color = "Car color is required";
      if (!formData.carDetails.plateNumber) errors.plateNumber = "Plate number is required";
      if (!formData.carPicture || !formData.carPicture.match(/^https:\/\/res\.cloudinary\.com\/.*$/)) {
        errors.carPicture = "Valid Cloudinary URL for car picture is required";
      }
      if (!formData.driverLicense || !formData.driverLicense.match(/^https:\/\/res\.cloudinary\.com\/.*$/)) {
        errors.driverLicense = "Valid Cloudinary URL for driver license is required";
      }
      if (!formData.certificateTraining || !formData.certificateTraining.match(/^https:\/\/res\.cloudinary\.com\/.*$/)) {
        errors.certificateTraining = "Valid Cloudinary URL for certificate is required";
      }
      if (!formData.maritalStatus) errors.maritalStatus = "Marital status is required";
      if (!formData.YOE || formData.YOE < 0) errors.YOE = "Valid years of experience is required";
      if (!formData.currentLocation) errors.currentLocation = "Current location is required";
      if (!formData.languageSpoken) errors.languageSpoken = "Language spoken is required";
      if (!formData.gearType) errors.gearType = "Gear type is required";
      if (!formData.vehicleType) errors.vehicleType = "Vehicle type is required";
      if (!formData.driverRoles.length) errors.driverRoles = "Select at least one role";

      if (formData.driverRoles.includes("hired")) {
        if (!formData.availableToBeHiredDetails.durationType) {
          errors.durationType = "Duration type is required";
        }
        if (
          ["day", "days", "week", "weeks", "month", "months"].includes(formData.availableToBeHiredDetails.durationType) &&
          (!formData.availableToBeHiredDetails.durationValue || formData.availableToBeHiredDetails.durationValue < 1)
        ) {
          errors.durationValue = "Valid duration value is required";
        }
        if (
          formData.availableToBeHiredDetails.durationType !== "permanent" &&
          !formData.availableToBeHiredDetails.endDate
        ) {
          errors.endDate = "End date is required";
        }
        if (!formData.availableToBeHiredDetails.minSalary || formData.availableToBeHiredDetails.minSalary < 0) {
          errors.minSalary = "Valid minimum salary is required";
        }
        if (!formData.availableToBeHiredDetails.typeOfCar) errors.typeOfCar = "Type of car is required";
        if (!formData.availableToBeHiredDetails.typeOfTransmission) {
          errors.typeOfTransmission = "Type of transmission is required";
        }
        if (!formData.availableToBeHiredDetails.choice) errors.choice = "Choice is required";
        if (!formData.availableToBeHiredDetails.startDate) errors.startDate = "Start date is required";
        if (
          !formData.availableToBeHiredDetails.timeToStart ||
          !formData.availableToBeHiredDetails.timeToStart.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]( (AM|PM))?$/)
        ) {
          errors.timeToStart = "Valid time format (e.g., 09:00 AM) is required";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e, name, nested = false) => {
    if (nested) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: e.target.value },
      });
    } else {
      setFormData({ ...formData, [name]: e.target.value });
    }
  };

  const handleNestedChange = (e, parent, child, grandChild = null) => {
    if (grandChild) {
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: { ...formData[parent][child], [grandChild]: e.target.value },
        },
      });
    } else {
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: e.target.value },
      });
    }
  };

  const handleDriverRoleChange = (role) => {
    setFormData({
      ...formData,
      driverRoles: formData.driverRoles.includes(role)
        ? formData.driverRoles.filter((r) => r !== role)
        : [...formData.driverRoles, role],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      const updatedValues = { ...formData };
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/profile/me`, updatedValues, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setIsEditing(false);
      setCloudinaryUrls({});
      setFormErrors({});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const openUploadWidget = (type) => {
    setUploadType(type);
    cloudinaryWidgetRef.current?.open();
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-12">{error}</div>;
  if (!profile) return <div className="text-center py-12">No profile found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          {isEditing ? "Edit Profile" : "My Profile"}
        </h2>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="userEmail"
                value={formData.userEmail}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                disabled
              />
              {formErrors.userEmail && <p className="text-red-600 text-sm">{formErrors.userEmail}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                name="isDriver"
                value={formData.isDriver}
                onChange={(e) => {
                  const isDriver = e.target.value === "true";
                  setFormData({ ...formData, isDriver, question: isDriver ? "" : formData.question });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
              >
                <option value="false">Client</option>
                <option value="true">Driver</option>
              </select>
            </div>
            {!formData.isDriver && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Are you a student or passenger?
                </label>
                <select
                  name="question"
                  value={formData.question}
                  onChange={(e) => handleChange(e, "question")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Select Option</option>
                  <option value="student">Student</option>
                  <option value="passenger">Passenger</option>
                </select>
                {formErrors.question && <p className="text-red-600 text-sm">{formErrors.question}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={(e) => handleChange(e, "gender")}
                    className="h-4 w-4 text-green-600 focus:ring-green-600"
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={(e) => handleChange(e, "gender")}
                    className="h-4 w-4 text-green-600 focus:ring-green-600"
                  />
                  <span>Female</span>
                </label>
              </div>
              {formErrors.gender && <p className="text-red-600 text-sm">{formErrors.gender}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  name="location.state"
                  value={formData.location.state}
                  onChange={(e) => handleNestedChange(e, "location", "state")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                />
                {formErrors.state && <p className="text-red-600 text-sm">{formErrors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LGA</label>
                <input
                  name="location.lga"
                  value={formData.location.lga}
                  onChange={(e) => handleNestedChange(e, "location", "lga")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                />
                {formErrors.lga && <p className="text-red-600 text-sm">{formErrors.lga}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                name="location.address"
                value={formData.location.address}
                onChange={(e) => handleNestedChange(e, "location", "address")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
              />
              {formErrors.address && <p className="text-red-600 text-sm">{formErrors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  type="number"
                  name="location.coordinates.lat"
                  value={formData.location.coordinates.lat}
                  onChange={(e) => handleNestedChange(e, "location", "coordinates", "lat")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  type="number"
                  name="location.coordinates.lng"
                  value={formData.location.coordinates.lng}
                  onChange={(e) => handleNestedChange(e, "location", "coordinates", "lng")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange(e, "phoneNumber")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
              />
              {formErrors.phoneNumber && <p className="text-red-600 text-sm">{formErrors.phoneNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <button
                type="button"
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                onClick={() => openUploadWidget("profilePicture")}
              >
                Upload Profile Picture
              </button>
              {(cloudinaryUrls.profilePicture || formData.profilePicture) && (
                <div className="mt-2">
                  <img
                    src={cloudinaryUrls.profilePicture || formData.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                </div>
              )}
              {formErrors.profilePicture && <p className="text-red-600 text-sm">{formErrors.profilePicture}</p>}
            </div>
            {!formData.isDriver && formData.question === "student" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">School ID</label>
                <button
                  type="button"
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  onClick={() => openUploadWidget("schoolId")}
                >
                  Upload School ID
                </button>
                {(cloudinaryUrls.schoolId || formData.schoolId) && (
                  <div className="mt-2">
                    <img
                      src={cloudinaryUrls.schoolId || formData.schoolId}
                      alt="School ID"
                      className="w-32 h-32 object-cover"
                    />
                  </div>
                )}
                {formErrors.schoolId && <p className="text-red-600 text-sm">{formErrors.schoolId}</p>}
              </div>
            )}
            {formData.isDriver && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Driver Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Car Picture</label>
                  <button
                    type="button"
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    onClick={() => openUploadWidget("carPicture")}
                  >
                    Upload Car Picture
                  </button>
                  {(cloudinaryUrls.carPicture || formData.carPicture) && (
                    <div className="mt-2">
                      <img
                        src={cloudinaryUrls.carPicture || formData.carPicture}
                        alt="Car"
                        className="w-32 h-32 object-cover"
                      />
                    </div>
                  )}
                  {formErrors.carPicture && <p className="text-red-600 text-sm">{formErrors.carPicture}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Driver's License</label>
                  <button
                    type="button"
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    onClick={() => openUploadWidget("driverLicense")}
                  >
                    Upload Driver's License
                  </button>
                  {(cloudinaryUrls.driverLicense || formData.driverLicense) && (
                    <div className="mt-2">
                      <img
                        src={cloudinaryUrls.driverLicense || formData.driverLicense}
                        alt="License"
                        className="w-32 h-32 object-cover"
                      />
                    </div>
                  )}
                  {formErrors.driverLicense && <p className="text-red-600 text-sm">{formErrors.driverLicense}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certificate of Training</label>
                  <button
                    type="button"
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    onClick={() => openUploadWidget("certificateTraining")}
                  >
                    Upload Certificate
                  </button>
                  {(cloudinaryUrls.certificateTraining || formData.certificateTraining) && (
                    <div className="mt-2">
                      <img
                        src={cloudinaryUrls.certificateTraining || formData.certificateTraining}
                        alt="Certificate"
                        className="w-32 h-32 object-cover"
                      />
                    </div>
                  )}
                  {formErrors.certificateTraining && (
                    <p className="text-red-600 text-sm">{formErrors.certificateTraining}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={(e) => handleChange(e, "maritalStatus")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">Select Status</option>
                    {["single", "married", "divorced", "widowed"].map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  {formErrors.maritalStatus && <p className="text-red-600 text-sm">{formErrors.maritalStatus}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="YOE"
                    value={formData.YOE}
                    onChange={(e) => handleChange(e, "YOE")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  {formErrors.YOE && <p className="text-red-600 text-sm">{formErrors.YOE}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
                  <input
                    name="currentLocation"
                    value={formData.currentLocation}
                    onChange={(e) => handleChange(e, "currentLocation")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  {formErrors.currentLocation && <p className="text-red-600 text-sm">{formErrors.currentLocation}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language Spoken</label>
                  <input
                    name="languageSpoken"
                    value={formData.languageSpoken}
                    onChange={(e) => handleChange(e, "languageSpoken")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  {formErrors.languageSpoken && <p className="text-red-600 text-sm">{formErrors.languageSpoken}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gear Type</label>
                  <div className="flex space-x-6">
                    {["manual", "automatic", "both"].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="gearType"
                          value={type}
                          checked={formData.gearType === type}
                          onChange={(e) => handleChange(e, "gearType")}
                          className="h-4 w-4 text-green-600 focus:ring-green-600"
                        />
                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.gearType && <p className="text-red-600 text-sm">{formErrors.gearType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={(e) => handleChange(e, "vehicleType")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">Select Type</option>
                    {["car", "jeep", "mini-bus", "bus", "trailer"].map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {formErrors.vehicleType && <p className="text-red-600 text-sm">{formErrors.vehicleType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Driver Roles</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["ride-hauling", "airport", "chartered", "hired"].map((role) => (
                      <label key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.driverRoles.includes(role)}
                          onChange={() => handleDriverRoleChange(role)}
                          className="h-4 w-4 text-green-600 focus:ring-green-600"
                        />
                        <span>{role.replace("-", " ").toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.driverRoles && <p className="text-red-600 text-sm">{formErrors.driverRoles}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interstate Travel</label>
                  <input
                    type="checkbox"
                    name="interstate"
                    checked={formData.interstate}
                    onChange={(e) => setFormData({ ...formData, interstate: e.target.checked })}
                    className="h-5 w-5 text-green-600 focus:ring-green-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Car Model</label>
                    <input
                      name="carDetails.model"
                      value={formData.carDetails.model}
                      onChange={(e) => handleNestedChange(e, "carDetails", "model")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                    />
                    {formErrors.model && <p className="text-red-600 text-sm">{formErrors.model}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Car Product</label>
                    <input
                      name="carDetails.product"
                      value={formData.carDetails.product}
                      onChange={(e) => handleNestedChange(e, "carDetails", "product")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                    />
                    {formErrors.product && <p className="text-red-600 text-sm">{formErrors.product}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Car Year</label>
                    <input
                      type="number"
                      name="carDetails.year"
                      value={formData.carDetails.year}
                      onChange={(e) => handleNestedChange(e, "carDetails", "year")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                    />
                    {formErrors.year && <p className="text-red-600 text-sm">{formErrors.year}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Car Color</label>
                    <input
                      name="carDetails.color"
                      value={formData.carDetails.color}
                      onChange={(e) => handleNestedChange(e, "carDetails", "color")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                    />
                    {formErrors.color && <p className="text-red-600 text-sm">{formErrors.color}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                  <input
                    name="carDetails.plateNumber"
                    value={formData.carDetails.plateNumber}
                    onChange={(e) => handleNestedChange(e, "carDetails", "plateNumber")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  {formErrors.plateNumber && <p className="text-red-600 text-sm">{formErrors.plateNumber}</p>}
                </div>
                {formData.driverRoles.includes("hired") && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Hired Driver Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration Type</label>
                      <select
                        name="availableToBeHiredDetails.durationType"
                        value={formData.availableToBeHiredDetails.durationType}
                        onChange={(e) => handleNestedChange(e, "availableToBeHiredDetails", "durationType")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                      >
                        <option value="">Select Type</option>
                        {["day", "days", "week", "weeks", "month", "months", "permanent", "temporary"].map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                      {formErrors.durationType && <p className="text-red-600 text-sm">{formErrors.durationType}</p>}
                    </div>
                    {["day", "days", "week", "weeks", "month", "months"].includes(
                      formData.availableToBeHiredDetails.durationType
                    ) && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Duration Value</label>
                          <input
                            type="number"
                            name="availableToBeHiredDetails.durationValue"
                            value={formData.availableToBeHiredDetails.durationValue}
                            onChange={(e) => handleNestedChange(e, "availableToBeHiredDetails", "durationValue")}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                          />
                          {formErrors.durationValue && (
                            <p className="text-red-600 text-sm">{formErrors.durationValue}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                          <input
                            type="date"
                            name="availableToBeHiredDetails.endDate"
                            value={formData.availableToBeHiredDetails.endDate}
                            onChange={(e) => handleNestedChange(e, "availableToBeHiredDetails", "endDate")}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                          />
                          {formErrors.endDate && <p className="text-red-600 text-sm">{formErrors.endDate}</p>}
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary (₦)</label>
                      <input
                        type="number"
                        name="availableToBeHiredDetails.minSalary"
                        value={formData.availableToBeHiredDetails.minSalary}
                        onChange={(e) => handleNestedChange(e, "availableToBeHiredDetails", "minSalary")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                      />
                      {formErrors.minSalary && <p className="text-red-600 text-sm">{formErrors.minSalary}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interstate Travel for Hired Role
                      </label>
                      <input
                        type="checkbox"
                        name="availableToBeHiredDetails.interstateTravel"
                        checked={formData.availableToBeHiredDetails.interstateTravel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            availableToBeHiredDetails: {
                              ...formData.availableToBeHiredDetails,
                              interstateTravel: e.target.checked,
                            },
                          })
                        }
                        className="h-5 w-5 text-green-600 focus:ring-green-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type of Car</label>
                      <select
                        name="availableToBeHiredDetails.typeOfCar"
                        value={formData.availableToBeHiredDetails.typeOfCar}
                        onChange={(e) => handleNestedChange(e, "availableToBeHiredDetails", "typeOfCar")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                      >
                        <option value="">Select Type</option>
                        {["car", "jeep", "mini-bus", "bus", "trailer"].map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                      {formErrors.typeOfCar && <p className="text-red-600 text-sm">{formErrors.typeOfCar}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type of Transmission</label>
                      <select
                        name="availableToBeHiredDetails.typeOfTransmission"
                        value={formData.availableToBeHiredDetails.typeOfTransmission}
                        onChange={(e) => handleNestedChange(e, "availableToBeHiredDetails", "typeOfTransmission")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                      >
                        <option value="">Select Type</option>
                        {["automatic", "manual", "both"].map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                      {formErrors.typeOfTransmission && (
                        <p className="text-red-600 text-sm">{formErrors.typeOfTransmission}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Choice</label>
                      <select
                        name="availableToBeHiredDetails.choice"
                        value={formData.availableToBeHiredDetails.choice}
                        onChange={(e) => handleNestedChange(e, "availableToBeHiredDetails", "choice")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                      >
                        <option value="">Select Choice</option>
                        {["private with accommodation", "private with no accommodation", "commercial with accommodation", "commercial with no accommodation"].map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                      {formErrors.choice && <p className="text-red-600 text-sm">{formErrors.choice}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        name="availableToBeHiredDetails.startDate"
                        value={formData.availableToBeHiredDetails.startDate}
                        onChange={(e) => handleNestedChange(e, "availableToBeHiredDetails", "startDate")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                      />
                      {formErrors.startDate && <p className="text-red-600 text-sm">{formErrors.startDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time to Start</label>
                      <input
                        type="text"
                        name="availableToBeHiredDetails.timeToStart"
                        value={formData.availableToBeHiredDetails.timeToStart}
                        onChange={(e) => handleNestedChange(e, "availableToBeHiredDetails", "timeToStart")}
                        placeholder="e.g., 09:00 AM"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                      />
                      {formErrors.timeToStart && <p className="text-red-600 text-sm">{formErrors.timeToStart}</p>}
                    </div>
                  </div>
                )}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700"
                    disabled={loading}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={profile?.profilePicture || "https://via.placeholder.com/100"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold">{profile?.userEmail || "Not specified"}</h3>
                <p className="text-gray-600">{profile?.isDriver ? "Driver" : "Client"}</p>
              </div>
            </div>
            <p><strong>Gender:</strong> {profile?.gender || "Not specified"}</p>
            <p>
              <strong>Location:</strong> {profile?.location?.state || "N/A"}, {profile?.location?.lga || "N/A"}
            </p>
            <p><strong>Phone Number:</strong> {profile?.phoneNumber || "Not specified"}</p>
            {!profile?.isDriver && profile?.question && <p><strong>Role:</strong> {profile?.question}</p>}
            {!profile?.isDriver && profile?.question === "student" && profile?.schoolId && (
              <div>
                <p><strong>School ID:</strong></p>
                <img src={profile?.schoolId} alt="School ID" className="w-32 h-32 object-cover" />
              </div>
            )}
            {profile?.isDriver && (
              <div>
                <p>
                  <strong>Car Details:</strong>{" "}
                  {[
                    profile?.carDetails?.model,
                    profile?.carDetails?.product,
                    profile?.carDetails?.year,
                    profile?.carDetails?.color,
                    profile?.carDetails?.plateNumber,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not specified"}
                </p>
                {profile?.carPicture && (
                  <div>
                    <p><strong>Car Picture:</strong></p>
                    <img src={profile?.carPicture} alt="Car" className="w-32 h-32 object-cover" />
                  </div>
                )}
                {profile?.driverLicense && (
                  <div>
                    <p><strong>Driver's License:</strong></p>
                    <img src={profile?.driverLicense} alt="License" className="w-32 h-32 object-cover" />
                  </div>
                )}
                {profile?.certificateTraining && (
                  <div>
                    <p><strong>Certificate of Training:</strong></p>
                    <img src={profile?.certificateTraining} alt="Certificate" className="w-32 h-32 object-cover" />
                  </div>
                )}
                <p><strong>Marital Status:</strong> {profile?.maritalStatus || "Not specified"}</p>
                <p><strong>Years of Experience:</strong> {profile?.YOE || "Not specified"}</p>
                <p><strong>Current Location:</strong> {profile?.currentLocation || "Not specified"}</p>
                <p><strong>Language Spoken:</strong> {profile?.languageSpoken || "Not specified"}</p>
                <p><strong>Gear Type:</strong> {profile?.gearType || "Not specified"}</p>
                <p><strong>Vehicle Type:</strong> {profile?.vehicleType || "Not specified"}</p>
                <p><strong>Driver Roles:</strong> {profile?.driverRoles?.join(", ") || "Not specified"}</p>
                <p><strong>Interstate:</strong> {profile?.interstate ? "Yes" : "No"}</p>
                {profile?.availableToBeHiredDetails && (
                  <div>
                    <p><strong>Hired Details:</strong></p>
                    <p>Duration Type: {profile?.availableToBeHiredDetails?.durationType || "N/A"}</p>
                    {profile?.availableToBeHiredDetails?.durationValue && (
                      <p>Duration Value: {profile?.availableToBeHiredDetails?.durationValue}</p>
                    )}
                    <p>Minimum Salary: ₦{profile?.availableToBeHiredDetails?.minSalary || "N/A"}</p>
                    <p>
                      Interstate Travel: {profile?.availableToBeHiredDetails?.interstateTravel ? "Yes" : "No"}
                    </p>
                    <p>Type of Car: {profile?.availableToBeHiredDetails?.typeOfCar || "N/A"}</p>
                    <p>Type of Transmission: {profile?.availableToBeHiredDetails?.typeOfTransmission || "N/A"}</p>
                    <p>Choice: {profile?.availableToBeHiredDetails?.choice || "N/A"}</p>
                    <p>
                      Start Date:{" "}
                      {profile?.availableToBeHiredDetails?.startDate
                        ? new Date(profile?.availableToBeHiredDetails?.startDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                    {profile?.availableToBeHiredDetails?.endDate && (
                      <p>
                        End Date: {new Date(profile?.availableToBeHiredDetails?.endDate).toLocaleDateString()}
                      </p>
                    )}
                    <p>Time to Start: {profile?.availableToBeHiredDetails?.timeToStart || "N/A"}</p>
                  </div>
                )}
              </div>
            )}
            <button
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 mt-6"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;