// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { FaEye, FaTimes, FaComment } from "react-icons/fa";
// import io from "socket.io-client";

// const HireADriver = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [filteredDrivers, setFilteredDrivers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState({
//     stateOfOrigin: "",
//     minSalary: "",
//     durationType: "",
//   });
//   const [advancedSearch, setAdvancedSearch] = useState({
//     startDate: "",
//     endDate: "",
//     state: "",
//     currentLocation: "",
//     choice: "",
//     gearTransmission: "",
//     vehicleType: "",
//     employmentType: "",
//   });
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [chatModalOpen, setChatModalOpen] = useState(false);
//   const [bookingModalOpen, setBookingModalOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [bookingDetails, setBookingDetails] = useState({
//     carInsured: false,
//     typeOfCar: "",
//     accommodationAvailable: false,
//     startDate: "",
//     startTime: "",
//     endDate: "",
//     employmentType: "",
//     tripType: "",
//     withinState: {
//       state: "",
//       pickupAddress: "",
//       destinationAddress: "",
//       tripOption: "",
//     },
//     interstate: {
//       pickupState: "",
//       pickupAddress: "",
//       destinationState: "",
//       destinationAddress: "",
//       pickupTime: "",
//       pickupDate: "",
//       amount: "",
//     },
//   });
//   const socketRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   const nigerianStates = [
//     "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
//     "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
//     "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
//     "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
//     "Yobe", "Zamfara"
//   ];

//   // Initialize Socket.IO
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
//       auth: { token },
//     });

//     socketRef.current.on("connect", () => console.log("Socket connected"));
//     socketRef.current.on("receiveMessage", (message) => setMessages((prev) => [...prev, message]));
//     socketRef.current.on("messageSent", (message) => setMessages((prev) => [...prev, message]));
//     socketRef.current.on("unreadCount", (count) => setUnreadCount(count));
//     socketRef.current.on("error", (error) => toast.error(error));

//     return () => socketRef.current.disconnect();
//   }, []);

//   // Fetch drivers
//   useEffect(() => {
//     const fetchDrivers = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           toast.error("Please log in");
//           setLoading(false);
//           return;
//         }
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/profile/availabledrivers`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const hiredDrivers = res.data.drivers.filter((driver) => driver.driverRoles.includes("hired"));
//         setDrivers(hiredDrivers);
//         setFilteredDrivers(hiredDrivers);
//       } catch (error) {
//         console.error("Error fetching drivers:", error.response?.data || error);
//         toast.error(error.response?.data?.message || "Failed to fetch drivers");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDrivers();
//   }, []);

//   // Filter drivers for basic search
//   useEffect(() => {
//     let filtered = drivers.filter((driver) => {
//       const stateMatch = search.stateOfOrigin
//         ? driver.location?.state?.toLowerCase().includes(search.stateOfOrigin.toLowerCase())
//         : true;
//       const salaryMatch = search.minSalary
//         ? driver.availableToBeHiredDetails?.minSalary <= Number(search.minSalary)
//         : true;
//       const durationMatch = search.durationType
//         ? driver.availableToBeHiredDetails?.durationType?.toLowerCase() === search.durationType.toLowerCase()
//         : true;
//       return stateMatch && salaryMatch && durationMatch;
//     });

 

//     // Apply advanced search filters
//     const advancedSearchCriteria = Object.values(advancedSearch).filter((value) => value).length;
//     if (advancedSearchCriteria >= 3) {
//       filtered = filtered.filter((driver) => {
//         let matchCount = 0;

//         // Start date
//         if (advancedSearch.startDate) {
//           const driverStartDate = new Date(driver.availableToBeHiredDetails?.startDate);
//           const searchStartDate = new Date(advancedSearch.startDate);
//           if (driverStartDate <= searchStartDate) matchCount++;
//         }

//         // End date
//         if (advancedSearch.endDate && driver.availableToBeHiredDetails?.endDate) {
//           const driverEndDate = new Date(driver.availableToBeHiredDetails.endDate);
//           const searchEndDate = new Date(advancedSearch.endDate);
//           if (driverEndDate >= searchEndDate) matchCount++;
//         }

//         // State
//         if (advancedSearch.state) {
//           if (driver.location?.state?.toLowerCase() === advancedSearch.state.toLowerCase())
//             matchCount++;
//         }

//         // Current location
//         if (advancedSearch.currentLocation) {
//           if (
//             driver.currentLocation
//               ?.toLowerCase()
//               .includes(advancedSearch.currentLocation.toLowerCase())
//           )
//             matchCount++;
//         }

//         // Choice
//         if (advancedSearch.choice) {
//           if (
//             driver.availableToBeHiredDetails?.choice?.toLowerCase() ===
//             advancedSearch.choice.toLowerCase()
//           )
//             matchCount++;
//         }

//         // Gear transmission
//         if (advancedSearch.gearTransmission) {
//           if (
//             driver.availableToBeHiredDetails?.typeOfTransmission?.toLowerCase() ===
//             advancedSearch.gearTransmission.toLowerCase()
//           )
//             matchCount++;
//         }

//         // Vehicle type
//         if (advancedSearch.vehicleType) {
//           if (driver.vehicleType?.toLowerCase() === advancedSearch.vehicleType.toLowerCase())
//             matchCount++;
//         }

//         // Employment type
//         if (advancedSearch.employmentType) {
//           if (
//             driver.availableToBeHiredDetails?.durationType?.toLowerCase() ===
//             advancedSearch.employmentType.toLowerCase()
//           ) {
//             matchCount++;
//             if (
//               advancedSearch.employmentType.toLowerCase() === "a trip" &&
//               !driver.interstate
//             ) {
//               matchCount--;
//             }
//           }
//         }

//         return matchCount >= 3;
//       });
//     }

//     setFilteredDrivers(filtered);
//   }, [search, advancedSearch, drivers]);

//   // Fetch message history
//   useEffect(() => {
//     if (chatModalOpen && selectedDriver) {
//       const fetchMessages = async () => {
//         try {
//           const token = localStorage.getItem("token");
//           const res = await axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/messages/history/${selectedDriver.userId._id}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           );
//           setMessages(res.data);
//           socketRef.current.emit("markAsRead", { senderId: selectedDriver.userId._id });
//         } catch (error) {
//           console.error("Error fetching messages:", error);
//           toast.error("Failed to load messages");
//         }
//       };
//       fetchMessages();
//     }
//   }, [chatModalOpen, selectedDriver]);

//   // Auto-scroll to latest message
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSearchChange = (e) => {
//     const { name, value } = e.target;
//     setSearch((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAdvancedSearchChange = (e) => {
//     const { name, value } = e.target;
//     setAdvancedSearch((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleBookingChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (name.includes("withinState") || name.includes("interstate")) {
//       const [section, field] = name.split(".");
//       setBookingDetails((prev) => ({
//         ...prev,
//         [section]: { ...prev[section], [field]: type === "checkbox" ? checked : value },
//       }));
//     } else {
//       setBookingDetails((prev) => ({
//         ...prev,
//         [name]: type === "checkbox" ? checked : value,
//       }));
//     }
//   };

//   const openDetailsModal = (driver) => setSelectedDriver(driver);
//   const openChatModal = (driver) => {
//     setSelectedDriver(driver);
//     setChatModalOpen(true);
//   };
//   const openBookingModal = (driver) => {
//     setSelectedDriver(driver);
//     setBookingModalOpen(true);
//   };

//   const closeModal = () => {
//     setSelectedDriver(null);
//     setChatModalOpen(false);
//     setBookingModalOpen(false);
//     setMessages([]);
//   };

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (!newMessage.trim()) return;
//     socketRef.current.emit("sendMessage", {
//       receiverId: selectedDriver.userId._id,
//       content: newMessage,
//     });
//     setNewMessage("");
//   };

//   const submitBooking = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const bookingData = {
//         driverId: selectedDriver.userId._id,
//         ...bookingDetails,
//       };
//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/bookings/create`,
//         bookingData,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Booking submitted successfully");
//       closeModal();
//     } catch (error) {
//       console.error("Error submitting booking:", error);
//       toast.error(error.response?.data?.message || "Failed to submit booking");
//     }
//   };

//   if (loading) {
//     return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-500 p-6">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Drivers to be Hired</h1>

//       {/* Unread Messages Badge */}
//       {unreadCount > 0 && (
//         <div className="fixed top-4 right-4 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
//           {unreadCount}
//         </div>
//       )}

//       {/* Basic Search Inputs */}
//       <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
//         <input
//           type="text"
//           name="stateOfOrigin"
//           value={search.stateOfOrigin}
//           onChange={handleSearchChange}
//           placeholder="Filter by State of Origin (e.g., Lagos)"
//           className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//         />
//         <input
//           type="number"
//           name="minSalary"
//           value={search.minSalary}
//           onChange={handleSearchChange}
//           placeholder="Max Salary (e.g., 50000)"
//           min="0"
//           className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//         />
//         <select
//           name="durationType"
//           value={search.durationType}
//           onChange={handleSearchChange}
//           className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//         >
//           <option value="">All Durations</option>
//           <option value="day">Day</option>
//           <option value="days">Days</option>
//           <option value="week">Week</option>
//           <option value="weeks">Weeks</option>
//           <option value="month">Month</option>
//           <option value="months">Months</option>
//           <option value="permanent">Permanent</option>
//           <option value="temporary">Temporary</option>
//         </select>
//       </div>

//       {/* Advanced Search Inputs */}
//       <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
//         <h2 className="text-xl font-semibold text-gray-900">Advanced Search</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           <input
//             type="date"
//             name="startDate"
//             value={advancedSearch.startDate}
//             onChange={handleAdvancedSearchChange}
//             className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//           />
//           <input
//             type="date"
//             name="endDate"
//             value={advancedSearch.endDate}
//             onChange={handleAdvancedSearchChange}
//             className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//           />
//           <select
//             name="state"
//             value={advancedSearch.state}
//             onChange={handleAdvancedSearchChange}
//             className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//           >
//             <option value="">Select State</option>
//             {nigerianStates.map((state) => (
//               <option key={state} value={state}>
//                 {state}
//               </option>
//             ))}
//           </select>
//           <input
//             type="text"
//             name="currentLocation"
//             value={advancedSearch.currentLocation}
//             onChange={handleAdvancedSearchChange}
//             placeholder="Current Location (e.g., Ikeja)"
//             className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//           />
//           <select
//             name="choice"
//             value={advancedSearch.choice}
//             onChange={handleAdvancedSearchChange}
//             className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//           >
//             <option value="">Select Choice</option>
//             <option value="private with accommodation">Private with Accommodation</option>
//             <option value="private with no accommodation">Private with No Accommodation</option>
//             <option value="commercial with accommodation">Commercial with Accommodation</option>
//             <option value="commercial with no accommodation">Commercial with No Accommodation</option>
//           </select>
//           <select
//             name="gearTransmission"
//             value={advancedSearch.gearTransmission}
//             onChange={handleAdvancedSearchChange}
//             className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//           >
//             <option value="">Select Gear Transmission</option>
//             <option value="automatic">Automatic</option>
//             <option value="manual">Manual</option>
//             <option value="both">Both</option>
//           </select>
//           <select
//             name="vehicleType"
//             value={advancedSearch.vehicleType}
//             onChange={handleAdvancedSearchChange}
//             className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//           >
//             <option value="">Select Vehicle Type</option>
//             <option value="car">Car</option>
//             <option value="jeep">Jeep</option>
//             <option value="mini-bus">Mini-Bus</option>
//             <option value="bus">Bus</option>
//             <option value="trailer">Trailer</option>
//           </select>
//           <select
//             name="employmentType"
//             value={advancedSearch.employmentType}
//             onChange={handleAdvancedSearchChange}
//             className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//           >
//             <option value="">Select Employment Type</option>
//             <option value="days">Days</option>
//             <option value="weeks">Weeks</option>
//             <option value="months">Months</option>
//             <option value="temporary">Temporary</option>
//             <option value="a trip">A Trip</option>
//             <option value="permanent">Permanent</option>
//           </select>
//         </div>
//       </div>

//       {/* Driver Grid */}
//       {filteredDrivers.length === 0 ? (
//         <p className="text-gray-600">No available drivers found</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredDrivers.map((driver) => (
//             <div
//               key={driver._id}
//               className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
//             >
//               <img
//                 src={driver.profilePicture || "https://via.placeholder.com/80"}
//                 alt="Profile"
//                 className="rounded-full w-20 h-20 object-cover mb-2"
//               />
//               <h2 className="text-xl font-semibold text-gray-800">
//                 {driver.userId?.firstName || "N/A"} {driver.userId?.lastName || "N/A"}
//               </h2>
//               <p className="text-sm text-gray-600">Email: {driver.userId?.email || "N/A"}</p>
//               <p className="text-sm text-gray-600">ID: {driver.userId?.uniqueNumber || "N/A"}</p>
//               <p className="text-sm text-gray-600">Phone: {driver.phoneNumber || "N/A"}</p>
//               <p className="text-sm text-gray-600">
//                 Location: {driver.location?.state || "N/A"}, {driver.location?.lga || "N/A"}
//               </p>
//               <p className="text-gray-600">
//                 Duration: {driver.availableToBeHiredDetails?.durationType || "N/A"}
//                 {driver.availableToBeHiredDetails?.durationValue
//                   ? ` (${driver.availableToBeHiredDetails.durationValue})`
//                   : ""}
//               </p>
//               <p className="text-gray-600">
//                 Min Salary: ₦{driver.availableToBeHiredDetails?.minSalary?.toLocaleString() || "N/A"}
//               </p>
//               <p className="text-gray-600">
//                 Start Date:{" "}
//                 {driver.availableToBeHiredDetails?.startDate
//                   ? new Date(driver.availableToBeHiredDetails.startDate).toLocaleDateString()
//                   : "N/A"}
//               </p>
//               <p className="text-gray-600">Choice: {driver.availableToBeHiredDetails?.choice || "N/A"}</p>
//               <p className="text-gray-600">Vehicle Type: {driver.vehicleType || "N/A"}</p>
//               <p className="text-gray-600">
//                 Gear Transmission: {driver.availableToBeHiredDetails?.typeOfTransmission || "N/A"}
//               </p>
//               <div className="mt-4 flex gap-2 flex-wrap">
//                 <button
//                   onClick={() => openDetailsModal(driver)}
//                   className="flex items-center bg-customGreen text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <FaEye className="mr-2" /> View More
//                 </button>
//                 <button
//                   onClick={() => openChatModal(driver)}
//                   className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
//                 >
//                   <FaComment className="mr-2" /> Chat
//                 </button>
//                 <button
//                   onClick={() => openBookingModal(driver)}
//                   className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
//                 >
//                   Book Driver
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Details Modal */}
//       {selectedDriver && !chatModalOpen && !bookingModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Driver Details</h3>
//               <button onClick={closeModal}>
//                 <FaTimes className="text-gray-600 hover:text-gray-900" size={20} />
//               </button>
//             </div>
//             <p>
//               <strong>Name:</strong> {selectedDriver.userId?.firstName || "N/A"}{" "}
//               {selectedDriver.userId?.lastName || "N/A"}
//             </p>
//             <p>
//               <strong>Email:</strong> {selectedDriver.userId?.email || "N/A"}
//             </p>
//             <p>
//               <strong>Phone:</strong> {selectedDriver.phoneNumber || "N/A"}
//             </p>
//             <p>
//               <strong>State:</strong> {selectedDriver.location?.state || "N/A"}
//             </p>
//             <p>
//               <strong>Current Location:</strong> {selectedDriver.currentLocation || "N/A"}
//             </p>
//             <p>
//               <strong>Duration:</strong> {selectedDriver.availableToBeHiredDetails?.durationType || "N/A"}
//               {selectedDriver.availableToBeHiredDetails?.durationValue
//                 ? ` (${selectedDriver.availableToBeHiredDetails.durationValue})`
//                 : ""}
//             </p>
//             <p>
//               <strong>Min Salary:</strong> ₦
//               {selectedDriver.availableToBeHiredDetails?.minSalary?.toLocaleString() || "N/A"}
//             </p>
//             <p>
//               <strong>Available From:</strong>{" "}
//               {selectedDriver.availableToBeHiredDetails?.startDate
//                 ? new Date(selectedDriver.availableToBeHiredDetails.startDate).toLocaleDateString()
//                 : "N/A"}
//             </p>
//             <p>
//               <strong>Choice:</strong> {selectedDriver.availableToBeHiredDetails?.choice || "N/A"}
//             </p>
//             <p>
//               <strong>Gear Transmission:</strong>{" "}
//               {selectedDriver.availableToBeHiredDetails?.typeOfTransmission || "N/A"}
//             </p>
//             <p>
//               <strong>Vehicle Type:</strong> {selectedDriver.vehicleType || "N/A"}
//             </p>
//             <button
//               onClick={closeModal}
//               className="mt-4 w-full bg-customGreen text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Chat Modal */}
//       {chatModalOpen && selectedDriver && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col h-[80vh]">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Chat with {selectedDriver.userId?.firstName || "Driver"}
//               </h3>
//               <button onClick={closeModal}>
//                 <FaTimes className="text-gray-600 hover:text-gray-900" size={20} />
//               </button>
//             </div>
//             <div className="flex-1 overflow-y-auto mb-4">
//               {messages.map((msg) => (
//                 <div
//                   key={msg._id}
//                   className={`mb-2 flex ${
//                     msg.senderId._id === localStorage.getItem("userId")
//                       ? "justify-end"
//                       : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-[70%] p-2 rounded-lg ${
//                       msg.senderId._id === localStorage.getItem("userId")
//                         ? "bg-customGreen text-white"
//                         : "bg-gray-200 text-gray-800"
//                     }`}
//                   >
//                     <p className="text-sm">{msg.content}</p>
//                     <p className="text-xs opacity-70">
//                       {new Date(msg.createdAt).toLocaleTimeString()}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>
//             <form onSubmit={sendMessage} className="flex gap-2">
//               <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 placeholder="Type a message..."
//                 className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//               />
//               <button
//                 type="submit"
//                 className="bg-customGreen text-white px-4 py-2 rounded-lg hover:bg-green-700"
//               >
//                 Send
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Booking Modal */}
//       {bookingModalOpen && selectedDriver && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
//           <div className="bg-white rounded-lg p-6 w-full max-w-lg my-8">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Book Driver</h3>
//               <button onClick={closeModal}>
//                 <FaTimes className="text-gray-600 hover:text-gray-900" size={20} />
//               </button>
//             </div>
//             <form onSubmit={submitBooking} className="flex flex-col gap-4">
//               <label className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   name="carInsured"
//                   checked={bookingDetails.carInsured}
//                   onChange={handleBookingChange}
//                 />
//                 Car Insured
//               </label>
//               <select
//                 name="typeOfCar"
//                 value={bookingDetails.typeOfCar}
//                 onChange={handleBookingChange}
//                 className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                 required
//               >
//                 <option value="">Select Car Type</option>
//                 <option value="car">Car</option>
//                 <option value="jeep">Jeep</option>
//                 <option value="mini-bus">Mini-Bus</option>
//                 <option value="bus">Bus</option>
//                 <option value="trailer">Trailer</option>
//               </select>
//               <label className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   name="accommodationAvailable"
//                   checked={bookingDetails.accommodationAvailable}
//                   onChange={handleBookingChange}
//                 />
//                 Accommodation Available
//               </label>
//               <div className="flex gap-4">
//                 <input
//                   type="date"
//                   name="startDate"
//                   value={bookingDetails.startDate}
//                   onChange={handleBookingChange}
//                   className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                   required
//                 />
//                 <input
//                   type="time"
//                   name="startTime"
//                   value={bookingDetails.startTime}
//                   onChange={handleBookingChange}
//                   className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                   required
//                 />
//               </div>
//               <input
//                 type="date"
//                 name="endDate"
//                 value={bookingDetails.endDate}
//                 onChange={handleBookingChange}
//                 className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//               />
//               <select
//                 name="employmentType"
//                 value={bookingDetails.employmentType}
//                 onChange={handleBookingChange}
//                 className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                 required
//               >
//                 <option value="">Select Employment Type</option>
//                 <option value="days">Days</option>
//                 <option value="weeks">Weeks</option>
//                 <option value="months">Months</option>
//                 <option value="temporary">Temporary</option>
//                 <option value="a trip">A Trip</option>
//                 <option value="permanent">Permanent</option>
//               </select>

//               {bookingDetails.employmentType === "a trip" && (
//                 <div className="flex flex-col gap-4">
//                   <select
//                     name="tripType"
//                     value={bookingDetails.tripType}
//                     onChange={handleBookingChange}
//                     className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                     required
//                   >
//                     <option value="">Select Trip Type</option>
//                     <option value="withinState">Within State</option>
//                     <option value="interstate">Interstate</option>
//                   </select>

//                   {bookingDetails.tripType === "withinState" && (
//                     <div className="flex flex-col gap-4">
//                       <select
//                         name="withinState.state"
//                         value={bookingDetails.withinState.state}
//                         onChange={handleBookingChange}
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       >
//                         <option value="">Select State</option>
//                         {nigerianStates.map((state) => (
//                           <option key={state} value={state}>
//                             {state}
//                           </option>
//                         ))}
//                       </select>
//                       <input
//                         type="text"
//                         name="withinState.pickupAddress"
//                         value={bookingDetails.withinState.pickupAddress}
//                         onChange={handleBookingChange}
//                         placeholder="Pickup Address"
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       />
//                       <input
//                         type="text"
//                         name="withinState.destinationAddress"
//                         value={bookingDetails.withinState.destinationAddress}
//                         onChange={handleBookingChange}
//                         placeholder="Destination Address"
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       />
//                       <select
//                         name="withinState.tripOption"
//                         value={bookingDetails.withinState.tripOption}
//                         onChange={handleBookingChange}
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       >
//                         <option value="">Select Trip Option</option>
//                         <option value="oneWay">Pickup to Destination</option>
//                         <option value="roundTrip">Pickup to Destination and Back</option>
//                       </select>
//                     </div>
//                   )}

//                   {bookingDetails.tripType === "interstate" && (
//                     <div className="flex flex-col gap-4">
//                       <select
//                         name="interstate.pickupState"
//                         value={bookingDetails.interstate.pickupState}
//                         onChange={handleBookingChange}
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       >
//                         <option value="">Select Pickup State</option>
//                         {nigerianStates.map((state) => (
//                           <option key={state} value={state}>
//                             {state}
//                           </option>
//                         ))}
//                       </select>
//                       <input
//                         type="text"
//                         name="interstate.pickupAddress"
//                         value={bookingDetails.interstate.pickupAddress}
//                         onChange={handleBookingChange}
//                         placeholder="Pickup Address"
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       />
//                       <select
//                         name="interstate.destinationState"
//                         value={bookingDetails.interstate.destinationState}
//                         onChange={handleBookingChange}
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       >
//                         <option value="">Select Destination State</option>
//                         {nigerianStates.map((state) => (
//                           <option key={state} value={state}>
//                             {state}
//                           </option>
//                         ))}
//                       </select>
//                       <input
//                         type="text"
//                         name="interstate.destinationAddress"
//                         value={bookingDetails.interstate.destinationAddress}
//                         onChange={handleBookingChange}
//                         placeholder="Destination Address"
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       />
//                       <input
//                         type="date"
//                         name="interstate.pickupDate"
//                         value={bookingDetails.interstate.pickupDate}
//                         onChange={handleBookingChange}
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       />
//                       <input
//                         type="time"
//                         name="interstate.pickupTime"
//                         value={bookingDetails.interstate.pickupTime}
//                         onChange={handleBookingChange}
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       />
//                       <input
//                         type="number"
//                         name="interstate.amount"
//                         value={bookingDetails.interstate.amount}
//                         onChange={handleBookingChange}
//                         placeholder="Amount to Pay (₦)"
//                         min="0"
//                         className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
//                         required
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}
//               <button
//                 type="submit"
//                 className="bg-customGreen text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 Submit Booking
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HireADriver;



























































































import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaTimes, FaComment } from "react-icons/fa";
import io from "socket.io-client";

const HireADriver = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({
    stateOfOrigin: "",
    minSalary: "",
    durationType: "",
  });
  const [advancedSearch, setAdvancedSearch] = useState({
    startDate: "",
    endDate: "",
    state: "",
    currentLocation: "",
    choice: "",
    gearTransmission: "",
    vehicleType: "",
    employmentType: "",
  });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [bookingDetails, setBookingDetails] = useState({
    carInsured: false,
    typeOfCar: "",
    accommodationAvailable: false,
    startDate: "",
    startTime: "",
    endDate: "",
    employmentType: "",
    tripType: "",
    withinState: {
      state: "",
      pickupAddress: "",
      destinationAddress: "",
      tripOption: "",
    },
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
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
  ];

  // Initialize Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("token");
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
    });

    socketRef.current.on("connect", () => console.log("Socket connected"));
    socketRef.current.on("receiveMessage", (message) => setMessages((prev) => [...prev, message]));
    socketRef.current.on("messageSent", (message) => setMessages((prev) => [...prev, message]));
    socketRef.current.on("unreadCount", (count) => setUnreadCount(count));
    socketRef.current.on("error", (error) => toast.error(error));

    return () => socketRef.current.disconnect();
  }, []);

  // Fetch drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in");
          setLoading(false);
          return;
        }
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/profile/availabledrivers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDrivers(res.data.drivers);
        setFilteredDrivers(res.data.drivers);
      } catch (error) {
        console.error("Error fetching drivers:", error.response?.data || error);
        toast.error(error.response?.data?.message || "Failed to fetch drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  // Filter drivers for basic and advanced search
  useEffect(() => {
    let filtered = drivers.filter((driver) => {
      const stateMatch = search.stateOfOrigin
        ? driver.location?.state?.toLowerCase().includes(search.stateOfOrigin.toLowerCase())
        : true;
      const salaryMatch = search.minSalary
        ? driver.availableToBeHiredDetails?.minSalary <= Number(search.minSalary)
        : true;
      const durationMatch = search.durationType
        ? driver.availableToBeHiredDetails?.durationType?.toLowerCase() === search.durationType.toLowerCase()
        : true;
      return stateMatch && salaryMatch && durationMatch;
    });

    const advancedSearchCriteria = Object.values(advancedSearch).filter((value) => value).length;
    if (advancedSearchCriteria >= 3) {
      filtered = filtered.filter((driver) => {
        let matchCount = 0;

        // Start date
        if (advancedSearch.startDate) {
          const driverStartDate = new Date(driver.availableToBeHiredDetails?.startDate);
          const searchStartDate = new Date(advancedSearch.startDate);
          if (driverStartDate <= searchStartDate) matchCount++;
        }

        // End date
        if (advancedSearch.endDate && driver.availableToBeHiredDetails?.endDate) {
          const driverEndDate = new Date(driver.availableToBeHiredDetails.endDate);
          const searchEndDate = new Date(advancedSearch.endDate);
          if (driverEndDate >= searchEndDate) matchCount++;
        }

        // State
        if (advancedSearch.state) {
          if (driver.location?.state?.toLowerCase() === advancedSearch.state.toLowerCase())
            matchCount++;
        }

        // Current location
        if (advancedSearch.currentLocation) {
          if (
            driver.currentLocation
              ?.toLowerCase()
              .includes(advancedSearch.currentLocation.toLowerCase())
          )
            matchCount++;
        }

        // Choice
        if (advancedSearch.choice) {
          if (
            driver.availableToBeHiredDetails?.choice?.toLowerCase() ===
            advancedSearch.choice.toLowerCase()
          )
            matchCount++;
        }

        // Gear transmission
        if (advancedSearch.gearTransmission) {
          if (
            driver.gearType?.toLowerCase() ===
            advancedSearch.gearTransmission.toLowerCase()
          )
            matchCount++;
        }

        // Vehicle type
        if (advancedSearch.vehicleType) {
          if (driver.vehicleType?.toLowerCase() === advancedSearch.vehicleType.toLowerCase())
            matchCount++;
        }

        // Employment type
        if (advancedSearch.employmentType) {
          if (
            driver.availableToBeHiredDetails?.durationType?.toLowerCase() ===
            advancedSearch.employmentType.toLowerCase()
          ) {
            matchCount++;
            if (
              advancedSearch.employmentType.toLowerCase() === "a trip" &&
              !driver.interstate
            ) {
              matchCount--;
            }
          }
        }

        return matchCount >= 3;
      });
    }

    setFilteredDrivers(filtered);
  }, [search, advancedSearch, drivers]);

  // Fetch message history
  useEffect(() => {
    if (chatModalOpen && selectedDriver) {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/messages/history/${selectedDriver.userId._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setMessages(res.data);
          socketRef.current.emit("markAsRead", { senderId: selectedDriver.userId._id });
        } catch (error) {
          console.error("Error fetching messages:", error);
          toast.error("Failed to load messages");
        }
      };
      fetchMessages();
    }
  }, [chatModalOpen, selectedDriver]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdvancedSearchChange = (e) => {
    const { name, value } = e.target;
    setAdvancedSearch((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("withinState") || name.includes("interstate")) {
      const [section, field] = name.split(".");
      setBookingDetails((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: type === "checkbox" ? checked : value },
      }));
    } else {
      setBookingDetails((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const openDetailsModal = (driver) => setSelectedDriver(driver);
  const openChatModal = (driver) => {
    setSelectedDriver(driver);
    setChatModalOpen(true);
  };
  const openBookingModal = (driver) => {
    setSelectedDriver(driver);
    setBookingModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDriver(null);
    setChatModalOpen(false);
    setBookingModalOpen(false);
    setMessages([]);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socketRef.current.emit("sendMessage", {
      receiverId: selectedDriver.userId._id,
      content: newMessage,
    });
    setNewMessage("");
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const bookingData = {
        driverId: selectedDriver.userId._id,
        ...bookingDetails,
      };
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/bookings/create`,
        bookingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Booking submitted successfully");
      closeModal();
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error(error.response?.data?.message || "Failed to submit booking");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-500 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Drivers to be Hired</h1>

      {/* Unread Messages Badge */}
      {unreadCount > 0 && (
        <div className="fixed top-4 right-4 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
          {unreadCount}
        </div>
      )}

      {/* Basic Search Inputs */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
        <input
          type="text"
          name="stateOfOrigin"
          value={search.stateOfOrigin}
          onChange={handleSearchChange}
          placeholder="Filter by State of Origin (e.g., Lagos)"
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
        />
        <input
          type="number"
          name="minSalary"
          value={search.minSalary}
          onChange={handleSearchChange}
          placeholder="Max Salary (e.g., 50000)"
          min="0"
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
        />
        <select
          name="durationType"
          value={search.durationType}
          onChange={handleSearchChange}
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
        >
          <option value="">All Durations</option>
          <option value="day">Day</option>
          <option value="days">Days</option>
          <option value="week">Week</option>
          <option value="weeks">Weeks</option>
          <option value="month">Month</option>
          <option value="months">Months</option>
          <option value="permanent">Permanent</option>
          <option value="temporary">Temporary</option>
        </select>
      </div>

      {/* Advanced Search Inputs */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Advanced Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="date"
            name="startDate"
            value={advancedSearch.startDate}
            onChange={handleAdvancedSearchChange}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
          />
          <input
            type="date"
            name="endDate"
            value={advancedSearch.endDate}
            onChange={handleAdvancedSearchChange}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
          />
          <select
            name="state"
            value={advancedSearch.state}
            onChange={handleAdvancedSearchChange}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
          >
            <option value="">Select State</option>
            {nigerianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="currentLocation"
            value={advancedSearch.currentLocation}
            onChange={handleAdvancedSearchChange}
            placeholder="Current Location (e.g., Ikeja)"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
          />
          <select
            name="choice"
            value={advancedSearch.choice}
            onChange={handleAdvancedSearchChange}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
          >
            <option value="">Select Choice</option>
            <option value="private with accommodation">Private with Accommodation</option>
            <option value="private with no accommodation">Private with No Accommodation</option>
            <option value="commercial with accommodation">Commercial with Accommodation</option>
            <option value="commercial with no accommodation">Commercial with No Accommodation</option>
          </select>
          <select
            name="gearTransmission"
            value={advancedSearch.gearTransmission}
            onChange={handleAdvancedSearchChange}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
          >
            <option value="">Select Gear Transmission</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
            <option value="both">Both</option>
          </select>
          <select
            name="vehicleType"
            value={advancedSearch.vehicleType}
            onChange={handleAdvancedSearchChange}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
          >
            <option value="">Select Vehicle Type</option>
            <option value="car">Car</option>
            <option value="jeep">Jeep</option>
            <option value="mini-bus">Mini-Bus</option>
            <option value="bus">Bus</option>
            <option value="trailer">Trailer</option>
          </select>
          <select
            name="employmentType"
            value={advancedSearch.employmentType}
            onChange={handleAdvancedSearchChange}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
          >
            <option value="">Select Employment Type</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="temporary">Temporary</option>
            <option value="a trip">A Trip</option>
            <option value="permanent">Permanent</option>
          </select>
        </div>
      </div>

      {/* Driver Grid or No Results Message */}
      {drivers.length === 0 ? (
        <p className="text-gray-600 text-center">No available drivers found</p>
      ) : filteredDrivers.length === 0 ? (
        <p className="text-gray-600 text-center">No driver qualities meet your search</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div
              key={driver._id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <img
                src={driver.profilePicture || "https://via.placeholder.com/80"}
                alt="Profile"
                className="rounded-full w-20 h-20 object-cover mb-2"
              />
              <h2 className="text-xl font-semibold text-gray-800">
                {driver.userId?.firstName || "N/A"} {driver.userId?.lastName || "N/A"}
              </h2>
              <p className="text-sm text-gray-600">Email: {driver.userId?.email || "N/A"}</p>
              <p className="text-sm text-gray-600">ID: {driver.userId?.uniqueNumber || "N/A"}</p>
              <p className="text-sm text-gray-600">Phone: {driver.phoneNumber || "N/A"}</p>
              <p className="text-sm text-gray-600">
                Location: {driver.location?.state || "N/A"}, {driver.location?.lga || "N/A"}
              </p>
              <p className="text-gray-600">
                Duration: {driver.availableToBeHiredDetails?.durationType || "N/A"}
                {driver.availableToBeHiredDetails?.durationValue
                  ? ` (${driver.availableToBeHiredDetails.durationValue})`
                  : ""}
              </p>
              <p className="text-gray-600">
                Min Salary: ₦{driver.availableToBeHiredDetails?.minSalary?.toLocaleString() || "N/A"}
              </p>
              <p className="text-gray-600">
                Start Date:{" "}
                {driver.availableToBeHiredDetails?.startDate
                  ? new Date(driver.availableToBeHiredDetails.startDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-gray-600">Choice: {driver.availableToBeHiredDetails?.choice || "N/A"}</p>
              <p className="text-gray-600">Vehicle Type: {driver.vehicleType || "N/A"}</p>
              <p className="text-gray-600">
                Gear Transmission: {driver.gearType || "N/A"}
              </p>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => openDetailsModal(driver)}
                  className="flex items-center bg-customGreen text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaEye className="mr-2" /> View More
                </button>
                <button
                  onClick={() => openChatModal(driver)}
                  className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaComment className="mr-2" /> Chat
                </button>
                <button
                  onClick={() => openBookingModal(driver)}
                  className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Book Driver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedDriver && !chatModalOpen && !bookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Driver Details</h3>
              <button onClick={closeModal}>
                <FaTimes className="text-gray-600 hover:text-gray-900" size={20} />
              </button>
            </div>
            <p>
              <strong>Name:</strong> {selectedDriver.userId?.firstName || "N/A"}{" "}
              {selectedDriver.userId?.lastName || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {selectedDriver.userId?.email || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {selectedDriver.phoneNumber || "N/A"}
            </p>
            <p>
              <strong>State:</strong> {selectedDriver.location?.state || "N/A"}
            </p>
            <p>
              <strong>Current Location:</strong> {selectedDriver.currentLocation || "N/A"}
            </p>
            <p>
              <strong>Duration:</strong> {selectedDriver.availableToBeHiredDetails?.durationType || "N/A"}
              {selectedDriver.availableToBeHiredDetails?.durationValue
                ? ` (${selectedDriver.availableToBeHiredDetails.durationValue})`
                : ""}
            </p>
            <p>
              <strong>Min Salary:</strong> ₦
              {selectedDriver.availableToBeHiredDetails?.minSalary?.toLocaleString() || "N/A"}
            </p>
            <p>
              <strong>Available From:</strong>{" "}
              {selectedDriver.availableToBeHiredDetails?.startDate
                ? new Date(selectedDriver.availableToBeHiredDetails.startDate).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>Choice:</strong> {selectedDriver.availableToBeHiredDetails?.choice || "N/A"}
            </p>
            <p>
              <strong>Gear Transmission:</strong>{" "}
              {selectedDriver.gearType || "N/A"}
            </p>
            <p>
              <strong>Vehicle Type:</strong> {selectedDriver.vehicleType || "N/A"}
            </p>
            <button
              onClick={closeModal}
              className="mt-4 w-full bg-customGreen text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Chat with {selectedDriver.userId?.firstName || "Driver"}
              </h3>
              <button onClick={closeModal}>
                <FaTimes className="text-gray-600 hover:text-gray-900" size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`mb-2 flex ${
                    msg.senderId._id === localStorage.getItem("userId")
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-2 rounded-lg ${
                      msg.senderId._id === localStorage.getItem("userId")
                        ? "bg-customGreen text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
              />
              <button
                type="submit"
                className="bg-customGreen text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Book Driver</h3>
              <button onClick={closeModal}>
                <FaTimes className="text-gray-600 hover:text-gray-900" size={20} />
              </button>
            </div>
            <form onSubmit={submitBooking} className="flex flex-col gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="carInsured"
                  checked={bookingDetails.carInsured}
                  onChange={handleBookingChange}
                />
                Car Insured
              </label>
              <select
                name="typeOfCar"
                value={bookingDetails.typeOfCar}
                onChange={handleBookingChange}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                required
              >
                <option value="">Select Car Type</option>
                <option value="car">Car</option>
                <option value="jeep">Jeep</option>
                <option value="mini-bus">Mini-Bus</option>
                <option value="bus">Bus</option>
                <option value="trailer">Trailer</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="accommodationAvailable"
                  checked={bookingDetails.accommodationAvailable}
                  onChange={handleBookingChange}
                />
                Accommodation Available
              </label>
              <div className="flex gap-4">
                <input
                  type="date"
                  name="startDate"
                  value={bookingDetails.startDate}
                  onChange={handleBookingChange}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                  required
                />
                <input
                  type="time"
                  name="startTime"
                  value={bookingDetails.startTime}
                  onChange={handleBookingChange}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                  required
                />
              </div>
              <input
                type="date"
                name="endDate"
                value={bookingDetails.endDate}
                onChange={handleBookingChange}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
              />
              <select
                name="employmentType"
                value={bookingDetails.employmentType}
                onChange={handleBookingChange}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
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

              {bookingDetails.employmentType === "a trip" && (
                <div className="flex flex-col gap-4">
                  <select
                    name="tripType"
                    value={bookingDetails.tripType}
                    onChange={handleBookingChange}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                    required
                  >
                    <option value="">Select Trip Type</option>
                    <option value="withinState">Within State</option>
                    <option value="interstate">Interstate</option>
                  </select>

                  {bookingDetails.tripType === "withinState" && (
                    <div className="flex flex-col gap-4">
                      <select
                        name="withinState.state"
                        value={bookingDetails.withinState.state}
                        onChange={handleBookingChange}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      >
                        <option value="">Select State</option>
                        {nigerianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="withinState.pickupAddress"
                        value={bookingDetails.withinState.pickupAddress}
                        onChange={handleBookingChange}
                        placeholder="Pickup Address"
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      />
                      <input
                        type="text"
                        name="withinState.destinationAddress"
                        value={bookingDetails.withinState.destinationAddress}
                        onChange={handleBookingChange}
                        placeholder="Destination Address"
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      />
                      <select
                        name="withinState.tripOption"
                        value={bookingDetails.withinState.tripOption}
                        onChange={handleBookingChange}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      >
                        <option value="">Select Trip Option</option>
                        <option value="oneWay">Pickup to Destination</option>
                        <option value="roundTrip">Pickup to Destination and Back</option>
                      </select>
                    </div>
                  )}

                  {bookingDetails.tripType === "interstate" && (
                    <div className="flex flex-col gap-4">
                      <select
                        name="interstate.pickupState"
                        value={bookingDetails.interstate.pickupState}
                        onChange={handleBookingChange}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      >
                        <option value="">Select Pickup State</option>
                        {nigerianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="interstate.pickupAddress"
                        value={bookingDetails.interstate.pickupAddress}
                        onChange={handleBookingChange}
                        placeholder="Pickup Address"
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      />
                      <select
                        name="interstate.destinationState"
                        value={bookingDetails.interstate.destinationState}
                        onChange={handleBookingChange}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      >
                        <option value="">Select Destination State</option>
                        {nigerianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="interstate.destinationAddress"
                        value={bookingDetails.interstate.destinationAddress}
                        onChange={handleBookingChange}
                        placeholder="Destination Address"
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      />
                      <input
                        type="date"
                        name="interstate.pickupDate"
                        value={bookingDetails.interstate.pickupDate}
                        onChange={handleBookingChange}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      />
                      <input
                        type="time"
                        name="interstate.pickupTime"
                        value={bookingDetails.interstate.pickupTime}
                        onChange={handleBookingChange}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      />
                      <input
                        type="number"
                        name="interstate.amount"
                        value={bookingDetails.interstate.amount}
                        onChange={handleBookingChange}
                        placeholder="Amount to Pay (₦)"
                        min="0"
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen"
                        required
                      />
                    </div>
                  )}
                </div>
              )}
              <button
                type="submit"
                className="bg-customGreen text-white py-2
 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Submit Booking
            </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HireADriver;