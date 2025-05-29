// // src/pages/HireADriver.jsx
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { FaEye, FaTimes } from "react-icons/fa";

// const HireADriver = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [filteredDrivers, setFilteredDrivers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState({
//     stateOfOrigin: "",
//     minSalary: "",
//     durationType: "",
//   });
//   const [selectedDriver, setSelectedDriver] = useState(null);

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
//         setDrivers(res.data.drivers);
//         setFilteredDrivers(res.data.drivers);
//         console.log("Fetched drivers:", res.data.drivers);
//       } catch (error) {
//         console.error("Error fetching drivers:", error.response?.data || error);
//         toast.error(error.response?.data?.message || "Failed to fetch drivers");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDrivers();
//   }, []);

//   useEffect(() => {
//     // Filter drivers based on search inputs
//     const filtered = drivers.filter((driver) => {
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
//     setFilteredDrivers(filtered);
//   }, [search, drivers]);

//   const handleSearchChange = (e) => {
//     const { name, value } = e.target;
//     setSearch((prev) => ({ ...prev, [name]: value }));
//   };

//   const openModal = (driver) => {
//     setSelectedDriver(driver);
//   };

//   const closeModal = () => {
//     setSelectedDriver(null);
//   };

//   if (loading) {
//     return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-500 p-6">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Drivers to be hired</h1>

//       {/* Search Inputs */}
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
//           <option value="week">Week</option>
//           <option value="weeks">Weeks</option>
//           <option value="month">Month</option>
//           <option value="permanent">Permanent</option>
//         </select>
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
//             <img src={driver.profilePicture} className="rounded-full w-20" />
//               <h2 className="text-xl font-semibold text-gray-800">
//                 {driver.userId?.firstName || "N/A"} {driver.userId?.lastName || "N/A"}
//               </h2>
//               <h2 className="text-sm  text-gray-800">
//                 {driver.userId?.email || "N/A"} 
//               </h2>
//               <h2 className="text-sm  text-gray-800">
//                 {driver.userId?.uniqueNumber || "N/A"} 
//               </h2>
//               <h2 className="text-sm  text-gray-800">
//                 {driver?.phoneNumber || "N/A"} 
//               </h2>
//               <h2 className="text-sm  text-gray-800">
//                 {driver?.location?.state || "N/A"},  {driver?.location?.lga || "N/A"},
//               </h2>
//               <p className="text-gray-600">
//                 Duration: {driver.availableToBeHiredDetails?.durationType || "N/A"}
//                 {driver.availableToBeHiredDetails?.durationValue
//                   ? ` (${driver.availableToBeHiredDetails.durationValue})`
//                   : ""}
//               </p>
//               <p className="text-gray-600">
//                 Min Salary: ₦{driver.availableToBeHiredDetails?.minSalary?.toLocaleString() || "N/A"}
//               </p>
//               <button
//                 onClick={() => openModal(driver)}
//                 className="mt-4 flex items-center bg-customGreen text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 <FaEye className="mr-2" /> View More
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Modal for Driver Details */}
//       {selectedDriver && (
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
//               <strong>State of Origin:</strong> {selectedDriver.stateOfOrigin || "N/A"}
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
//             <button
//               onClick={closeModal}
//               className="mt-4 w-full bg-customGreen text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HireADriver;















// src/pages/HireADriver.jsx
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
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("token");
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
    });

    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("messageSent", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("unreadCount", (count) => {
      setUnreadCount(count);
    });

    socketRef.current.on("error", (error) => {
      toast.error(error);
    });

    return () => {
      socketRef.current.disconnect();
    };
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
        console.log("Fetched drivers:", res.data.drivers);
      } catch (error) {
        console.error("Error fetching drivers:", error.response?.data || error);
        toast.error(error.response?.data?.message || "Failed to fetch drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  // Filter drivers
  useEffect(() => {
    const filtered = drivers.filter((driver) => {
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
    setFilteredDrivers(filtered);
  }, [search, drivers]);

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
          // Mark messages as read
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

  const openDetailsModal = (driver) => {
    setSelectedDriver(driver);
  };

  const openChatModal = (driver) => {
    setSelectedDriver(driver);
    setChatModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDriver(null);
    setChatModalOpen(false);
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

      {/* Search Inputs */}
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

      {/* Driver Grid */}
      {filteredDrivers.length === 0 ? (
        <p className="text-gray-600">No available drivers found</p>
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
              <div className="mt-4 flex gap-2">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedDriver && !chatModalOpen && (
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
    </div>
  );
};

export default HireADriver;