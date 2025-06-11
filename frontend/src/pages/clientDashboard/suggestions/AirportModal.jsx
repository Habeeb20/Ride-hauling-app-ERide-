





// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { nigeriaAirportsByState } from "../../../airportAndState";
// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// const AirportModal = ({ mode, onClose }) => {
//   const [formData, setFormData] = useState({
//     state: "",
//     airportName: "",
//     homeAddress: "",
//     time: "",
//     date: "",
//     passengers: 1,
//   });
//   const [loading, setLoading] = useState(false);
//   const [distance, setDistance] = useState(null);
//   const [duration, setDuration] = useState(null);
//   const [price, setPrice] = useState(null);
//   const [mapError, setMapError] = useState(null);
//   const [showConfirmationModal, setShowConfirmationModal] = useState(false);
//   const [submittedData, setSubmittedData] = useState(null);
//   const mapRef = useRef(null);

//   const mapContainerStyle = { width: "100%", height: "300px" };
//   const center = { lat: 9.0820, lng: 8.6753 }; // Center of Nigeria

//   useEffect(() => {
//     if (formData.state && formData.airportName && formData.homeAddress) {
//       calculateDistance();
//     }
//   }, [formData.state, formData.airportName, formData.homeAddress]);

//   const calculateDistance = async () => {
//     try {
//       const origin = formData.homeAddress;
//       const destination = `${formData.airportName}, ${formData.state}, Nigeria`;
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
//           origin
//         )}&destinations=${encodeURIComponent(destination)}&key=${
//           import.meta.env.VITE_GOOGLE_MAPS_API_KEY
//         }`
//       );
//       const result = response.data.rows[0].elements[0];
//       if (result.status === "OK") {
//         setDistance(result.distance.text);
//         setDuration(result.duration.text);
//         const distanceKm = result.distance.value / 1000;
//         const durationMin = result.duration.value / 60;
//         const calculatedPrice = distanceKm * 500 + durationMin * 100;
//         setPrice(calculatedPrice.toFixed(2));
//         setMapError(null);
//       } else {
//         setMapError("Unable to calculate distance");
//         toast.error("Unable to calculate distance");
//       }
//     } catch (error) {
//       console.error("Error calculating distance:", error);
//       setMapError("Failed to load distance data");
//       toast.error("Failed to calculate distance");
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (name === "state") {
//       setFormData((prev) => ({ ...prev, airportName: "" }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const userId = localStorage.getItem("userId");
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const user = response.data.user;
//       const data = {
//         userId,
//         fullName: `${user.firstName} ${user.lastName}`,
//         email: user.email,
//         phoneNumber: user.phoneNumber,
//         mode,
//         ...formData,
//         distance,
//         duration,
//         price,
//       };
//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/airport/request`,
//         data,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Airport request submitted successfully");
//       setSubmittedData(data);
//       setShowConfirmationModal(true);
//     } catch (error) {
//       console.error("Error submitting request:", error);
//       toast.error(error.response?.data?.message || "Failed to submit request");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendToAdmin = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/airport/admin-request`,
//         submittedData,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Details sent to admin successfully");
//       setShowConfirmationModal(false);
//       onClose();
//     } catch (error) {
//       console.error("Error sending to admin:", error);
//       toast.error(error.response?.data?.message || "Failed to send details to admin");
//     }
//   };

//   const handleCloseConfirmation = () => {
//     setShowConfirmationModal(false);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-2xl font-bold text-gray-900">
//             Airport {mode === "pickup" ? "Pickup" : "Drop Off"}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             Close
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
//             <select
//               name="state"
//               value={formData.state}
//               onChange={handleChange}
//               className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//               required
//             >
//               <option value="">Select a State</option>
//               {Object.keys(nigeriaAirportsByState).map((state) => (
//                 <option key={state} value={state}>{state}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Airport</label>
//             <select
//               name="airportName"
//               value={formData.airportName}
//               onChange={handleChange}
//               className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//               required
//               disabled={!formData.state}
//             >
//               <option value="">Select an Airport</option>
//               {formData.state &&
//                 nigeriaAirportsByState[formData.state].map((airport) => (
//                   <option key={airport} value={airport}>{airport}</option>
//                 ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               {mode === "pickup" ? "Pickup Address" : "Drop Off Address"}
//             </label>
//             <input
//               type="text"
//               name="homeAddress"
//               value={formData.homeAddress}
//               onChange={handleChange}
//               className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//             <input
//               type="date"
//               name="date"
//               value={formData.date}
//               onChange={handleChange}
//               className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
//             <input
//               type="time"
//               name="time"
//               value={formData.time}
//               onChange={handleChange}
//               className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Number of Passengers</label>
//             <input
//               type="number"
//               name="passengers"
//               value={formData.passengers}
//               onChange={handleChange}
//               min="1"
//               className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//               required
//             />
//           </div>
//           {distance && duration && price ? (
//             <div className="mt-4">
//               <p><strong>Distance:</strong> {distance}</p>
//               <p><strong>Duration:</strong> {duration}</p>
//               <p><strong>Estimated Price:</strong> ₦{price}</p>
//               {!mapError ? (
//                 <LoadScript
//                   googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
//                   onError={() => setMapError("Failed to load map")}
//                 >
//                   <GoogleMap
//                     mapContainerStyle={mapContainerStyle}
//                     center={center}
//                     zoom={6}
//                     onLoad={(map) => (mapRef.current = map)}
//                   >
//                     <Marker position={center} />
//                   </GoogleMap>
//                 </LoadScript>
//               ) : (
//                 <p className="text-red-500">{mapError}</p>
//               )}
//             </div>
//           ) : mapError ? (
//             <p className="text-red-500">{mapError}</p>
//           ) : null}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 min-h-[48px] z-10 relative flex items-center justify-center ${
//               loading ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//           >
//             {loading ? (
//               <>
//                 <svg
//                   className="animate-spin h-5 w-5 mr-2 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 Submitting...
//               </>
//             ) : (
//               "Submit Request"
//             )}
//           </button>
//         </form>
//       </div>

//       {showConfirmationModal && (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4">
//             <h3 className="text-xl font-bold text-gray-900 mb-4">
//               Send Details to Admin?
//             </h3>
//             <p className="text-gray-700 mb-6">
//               Would you like to send the airport request details to the admin as well?
//             </p>
//             <div className="flex space-x-4">
//               <button
//                 onClick={handleSendToAdmin}
//                 className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
//               >
//                 Yes
//               </button>
//               <button
//                 onClick={handleCloseConfirmation}
//                 className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//               >
//                 No
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AirportModal;






import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { nigeriaAirportsByState } from "../../../airportAndState";

const AirportModal = ({ mode, onClose }) => {
  const [formData, setFormData] = useState({
    state: "",
    airportName: "",
    homeAddress: "",
    time: "",
    date: "",
    passengers: 1,
  });
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [price, setPrice] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const mapContainerStyle = { width: "100%", height: "300px" };
  const center = { lat: 9.0820, lng: 8.6753 }; // Center of Nigeria

  useEffect(() => {
    if (formData.state && formData.airportName && formData.homeAddress) {
      calculateDistance();
    }
  }, [formData.state, formData.airportName, formData.homeAddress]);

  const calculateDistance = async () => {
    try {
      const origin = formData.homeAddress;
      const destination = `${formData.airportName}, ${formData.state}, Nigeria`;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
          origin
        )}&destinations=${encodeURIComponent(destination)}&key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }`
      );
      const result = response.data.rows[0].elements[0];
      if (result.status === "OK") {
        setDistance(result.distance.text);
        setDuration(result.duration.text);
        const distanceKm = result.distance.value / 1000;
        const durationMin = result.duration.value / 60;
        const calculatedPrice = distanceKm * 500 + durationMin * 100;
        setPrice(calculatedPrice.toFixed(2));
        setMapError(null);
      } else {
        setMapError("Unable to calculate distance");
        toast.error("Unable to calculate distance");
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      setMapError("Failed to load distance data");
      toast.error("Failed to calculate distance");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "state") {
      setFormData((prev) => ({ ...prev, airportName: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const user = response.data.user;
      const data = {
        userId,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phoneNumber: user.phoneNumber,
        mode,
        ...formData,
        distance,
        duration,
        price,
      };
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/airport/request`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Airport request submitted successfully");
      setSubmittedData(data);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAdmin = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/airport/admin-request`,
        submittedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Details sent to admin successfully");
      setShowConfirmationModal(false);
      onClose();
    } catch (error) {
      console.error("Error sending to admin:", error);
      toast.error(error.response?.data?.message || "Failed to send details to admin");
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmationModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Airport {mode === "pickup" ? "Pickup" : "Drop Off"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a State</option>
              {Object.keys(nigeriaAirportsByState).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Airport</label>
            <select
              name="airportName"
              value={formData.airportName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
              disabled={!formData.state}
            >
              <option value="">Select an Airport</option>
              {formData.state &&
                nigeriaAirportsByState[formData.state].map((airport) => (
                  <option key={airport} value={airport}>{airport}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === "pickup" ? "Pickup Address" : "Drop Off Address"}
            </label>
            <input
              type="text"
              name="homeAddress"
              value={formData.homeAddress}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Passengers</label>
            <input
              type="number"
              name="passengers"
              value={formData.passengers}
              onChange={handleChange}
              min="1"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          {distance && duration && price ? (
            <div className="mt-4">
              <p><strong>Distance:</strong> {distance}</p>
              <p><strong>Duration:</strong> {duration}</p>
              <p><strong>Estimated Price:</strong> ₦{price}</p>
            </div>
          ) : mapError ? (
            <p className="text-red-500">{mapError}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 min-h-[48px] z-10 relative flex items-center justify-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </form>
      </div>

      {showConfirmationModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Send Details to Admin?
            </h3>
            <p className="text-gray-700 mb-6">
              Would you like to send the airport request details to the admin as well?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleSendToAdmin}
                className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Yes
              </button>
              <button
                onClick={handleCloseConfirmation}
                className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportModal;
