

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaTachometerAlt, FaUsers, FaUserCheck, FaCog, FaEye } from "react-icons/fa";
import Login from "../../pages/Auth/Login";

// Sidebar animation variants (only for mobile)
const sidebarVariants = {
  open: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  closed: { x: "-100%", transition: { duration: 0.3, ease: "easeInOut" } },
};

// Main content animation variants
const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

// Modal animation variants
const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const Admin = () => {
  const [erranders, setErranders] = useState([]);
  const [data, setData] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("erranders");
  const [selectedErrander, setSelectedErrander] = useState(null);
  const [loadingActions, setLoadingActions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openCollapsible, setOpenCollapsible] = useState(null); // Added state
  const [dataLoading, setDataLoading] = useState(true); // Added for fetchData
  const [users, setUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const navigate = useNavigate();

  // Fetch admin data on mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/adminDashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setData(response.data.data || {});
        toast.success("You are welcome back", {
          style: { background: "#4CAF50", color: "white" },
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("An error occurred while fetching dashboard data", {
          style: { background: "#F44", color: "white" },
        });
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Fetch erranders
  const fetchErranders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/drivers`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setErranders(response.data.data || []);
      console.log("Erranders Response:", JSON.stringify(response.data.data, null, 2));
    } catch (error) {
      console.error("Error fetching erranders:", error);
      toast.error("Failed to fetch erranders", {
        style: { background: "#F44", color: "white" },
      });
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };



    // Fetch users
    const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/clients`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );
          setUsers(response.data?.profiles );
          console.log("clientss Response:", JSON.stringify(response.data.data, null, 2));
        } catch (error) {
          console.error("Error fetching erranders:", error);
          toast.error("Failed to fetch cleintss", {
            style: { background: "#F44", color: "white" },
          });
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          }
        } finally {
          setLoading(false);
        }
      };


        // Fetch all users
    const fetchAllUsers = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/allusers`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );
          setAllUsers(response.data.data );
          console.log("users Response:", JSON.stringify(response.data.data, null, 2));
        } catch (error) {
          console.error("Error fetching allusers:", error);
          toast.error("Failed to fetch allusers", {
            style: { background: "#F44", color: "white" },
          });
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          }
        } finally {
          setLoading(false);
        }
      };


  useEffect(() => {
    fetchErranders();
    fetchUsers()
    fetchAllUsers()
  }, [navigate]);

  // Open modal (desktop)
  const openModal = (errander) => {
    setSelectedErrander(errander);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setSelectedErrander(null);
    setIsModalOpen(false);
  };

  // Toggle collapsible (mobile)
  const toggleCollapsible = (id) => {
    setOpenCollapsible(openCollapsible === id ? null : id);
  };

  const handleVerify = async (errander) => {
    if (!errander.userId?._id) {
      toast.error("Cannot verify: User ID not found", {
        style: { background: "#F44", color: "white" },
      });
      return;
    }

    const userId = errander.userId?._id;
    console.log(userId)
    setLoadingActions((prev) => ({ ...prev, [`verify-${errander._id}`]: true }));
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-user/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchErranders();
      toast.success("Errander verified successfully", {
        style: { background: "#4CAF50", color: "white" },
      });
    } catch (error) {
      console.error("Error verifying errander:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to verify errander", {
        style: { background: "#F44", color: "white" },
      });
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`verify-${errander._id}`]: false }));
    }
  };

  const handleBlacklist = async (errander, isBlacklisted) => {
    if (!errander.userId?._id) {
      toast.error("Cannot update blacklist status: User ID not found", {
        style: { background: "#F44", color: "white" },
      });
      return;
    }

    const userId = errander.userId._id;
    setLoadingActions((prev) => ({ ...prev, [`blacklist-${errander._id}`]: true }));
    
    try {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/blacklist-user/${userId}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        await fetchUsers();
        toast.success('User blacklisted successfully', {
          style: { background: '#4CAF50', color: 'white' },
        });
      } catch (error) {
        console.error('Error blacklisting user:', error.response?.data || error);
        toast.error(error.response?.data?.message || 'Failed to blacklist user', {
          style: { background: '#FF4444', color: 'white' },
        });
      } finally {
        setLoadingActions((prev) => ({ ...prev, [`blacklist-${errander._id}`]: false }));
      }
  };


// const handleBlacklist = async (user, setLoadingActions, fetchUsers) => {
//     if (!user.userId?._id) {
//       toast.error('Cannot blacklist: User ID not found', {
//         style: { background: '#FF4444', color: 'white' },
//       });
//       return;
//     }
  
//     const userId = user.userId._id;
//     console.log('Blacklisting user ID:', userId);
//     setLoadingActions((prev) => ({ ...prev, [`blacklist-${user._id}`]: true }));
  
//     try {
//       await axios.put(
//         `${import.meta.env.VITE_BACKEND_URL}/api/auth/blacklist-user/${userId}`,
//         {},
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       await fetchUsers();
//       toast.success('User blacklisted successfully', {
//         style: { background: '#4CAF50', color: 'white' },
//       });
//     } catch (error) {
//       console.error('Error blacklisting user:', error.response?.data || error);
//       toast.error(error.response?.data?.message || 'Failed to blacklist user', {
//         style: { background: '#FF4444', color: 'white' },
//       });
//     } finally {
//       setLoadingActions((prev) => ({ ...prev, [`blacklist-${user._id}`]: false }));
//     }
//   };
  
  const handleFeature = async (errander, isFeatured) => {
    if (!errander.userId?._id) {
      toast.error("Cannot update feature status: User ID not found", {
        style: { background: "#F44", color: "white" },
      });
      return;
    }

    const userId = errander.userId._id;
    setLoadingActions((prev) => ({ ...prev, [`feature-${errander._id}`]: true }));
    try {
      const endpoint = isFeatured
        ? `/unfeature-errander/${userId}`
        : `/feature-errander/${userId}`;
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchErranders();
      toast.success(
        isFeatured
          ? "Errander unfeatured successfully"
          : "Errander featured successfully",
        {
          style: { background: "#4CAF50", color: "white" },
        }
      );
    } catch (error) {
      console.error("Error updating feature status:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to update feature status", {
        style: { background: "#F44", color: "white" },
      });
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`feature-${errander._id}`]: false }));
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Modal for viewing errander details
  const ErranderModal = ({ errander, onClose }) => (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Errander Details</h2>
        <div className="flex items-center mt-2">
          <img
            src={errander.profilePicture || "https://via.placeholder.com/50"}
            alt={`${errander.userId?.firstName}'s profile`}
            className="w-12 h-12 rounded-full mr-2"
          />
        </div>
        <div className="space-y-2">
          <p>
            <strong>Name:</strong>{" "}
            {`${errander.userId?.firstName || "N/A"} ${errander.userId?.lastName || "N/A"}`}
          </p>
          <p>
            <strong>Email:</strong> {errander.userId?.email || "N/A"}
          </p>
          <p>
            <strong>Phone Number:</strong> {errander.userId?.phone || "N/A"}
          </p>
          <p>
            <strong>Unique Number:</strong> {errander.userId?.uniqueNumber || "N/A"}
          </p>
          <p>
            <strong>Verification Status:</strong>{" "}
            {errander.userId?.verificationStatus || "N/A"}
          </p>
          <p>
            <strong>Blacklisted:</strong>{" "}
            {errander.userId?.isBlacklisted ? "Yes" : "No"}
          </p>
          <p>
            <strong>Featured:</strong> {errander.userId?.isFeatured ? "Yes" : "No"}
          </p>
          <p>
            <strong>Age:</strong> {errander.age || "N/A"}
          </p>
          <p>
            <strong>Gender:</strong> {errander.gender || "N/A"}
          </p>
          <p>
            <strong>State:</strong> {errander.state || "N/A"}
          </p>
          <p>
            <strong>LGA:</strong> {errander.LGA || "N/A"}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(errander.createdAt).toLocaleDateString()}
          </p>
          {/* View Income Button */}
          <button
            onClick={() => openModal(errander)}
            className="lg:block hidden w-full py-2 px-4 bg-[#F4B400] text-[#1C2526] hover:bg-[#FFC107] rounded-lg font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#F4B400]"
            aria-label={`View income details for ${errander.userId?.firstName}`}
          >
            View Income
          </button>
          <button
            onClick={() => toggleCollapsible(errander._id)}
            className="lg:hidden w-full py-2 px-4 bg-[#F4B400] text-[#1C2526] hover:bg-[#FFC107] rounded-lg font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#F4B400]"
            aria-label={`Toggle income details for ${errander.userId?.firstName}`}
          >
            {openCollapsible === errander._id ? "Hide Income" : "View Income"}
          </button>
          {openCollapsible === errander._id && (
            <div className="mt-4 p-4 bg-[#1B5E91]/50 rounded-lg lg:hidden">
              <p className="text-white mb-2">
                Comments: {errander.commentCount || 0}
              </p>
              <p className="text-white mb-2">
                Completed Errands: {errander.completedErrandsCount || 0}
              </p>
              <p className="text-white mb-2">
                Canceled Errands: {errander.canceledErrandsCount || 0}
              </p>
              <p className="text-white mb-2">
                Total Income: ₦{(errander.totalIncome || 0).toFixed(2)}
              </p>
              <p className="text-white mb-2">
                Platform Fee: ₦{(errander.platformFee || 0).toFixed(2)}
              </p>
              <p className="text-white mb-2">
                Income After Fee: ₦{(errander.incomeAfterFee || 0).toFixed(2)}
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, loading, label }) => (
    <div className="flex items-center space-x-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          disabled={loading}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition duration-300">
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition duration-300 ${
              checked ? "translate-x-5" : "translate-x-0"
            } ${loading ? "opacity-50" : ""}`}
          ></div>
        </div>
      </label>
      <span className="text-sm text-gray-600">{label}</span>
      {loading && (
        <svg
          className="animate-spin h-5 w-5 text-green-500"
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
      )}
    </div>
  );

  // Dashboard Content
  const DashboardContent = () => (
    <motion.div
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {dataLoading ? (
        <p className="text-gray-600">Loading dashboard data...</p>
      ) : (
        <>
          <p className="text-gray-600">
            Welcome to the admin dashboard. Here you can view key metrics and manage your platform.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-green-100 rounded-lg">
              <h3 className="text-lg font-semibold">Total Users</h3>
              <p className="text-2xl font-bold">{allUsers.length || 0}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <h3 className="text-lg font-semibold">Total Drivers</h3>
              <p className="text-2xl font-bold">{erranders.length}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <h3 className="text-lg font-semibold">Total clients</h3>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <h3 className="text-lg font-semibold">Pending Verifications</h3>
              <p className="text-2xl font-bold">
                {erranders.filter((e) => e.userId?.verificationStatus === "unverified").length}
              </p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <h3 className="text-lg font-semibold">Verified users</h3>
              <p className="text-2xl font-bold">
                {erranders.filter((e) => e.userId?.verificationStatus === "verified").length}
              </p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <h3 className="text-lg font-semibold">Total blacklisted users</h3>
              <p className="text-2xl font-bold">
                {erranders.filter((e) => e.userId?.isBlacklisted === "true").length}
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );

  // Erranders Content with Toggles and View Button
  const ErrandersContent = () => (
    <motion.div
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Manage drivers</h2>
      {loading ? (
        <p className="text-gray-600">Loading drivers...</p>
      ) : erranders.length === 0 ? (
        <p className="text-gray-600">No drivers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-500 text-white">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Verified</th>
                <th className="p-4 text-left">Blacklisted</th>
                <th className="p-4 text-left">Featured</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {erranders.map((errander) => (
                <tr
                  key={errander._id}
                  className="border-b hover:bg-gray-50 transition duration-200"
                >
                  <td className="p-4">
                    {`${errander?.userId?.firstName || "N/A"} ${errander?.userId?.lastName || "N/A"}`}
                  </td>
                  <td className="p-4">{errander.userId?.email || "N/A"}</td>
                  <td className="p-4">
                    <ToggleSwitch
                      checked={errander.userId?.verificationStatus === "verified"}
                      onChange={() => handleVerify(errander)}
                      loading={loadingActions[`verify-${errander._id}`]}
                      label={
                        errander.userId?.verificationStatus === "verified"
                          ? "Verified"
                          : "Pending"
                      }
                    />
                  </td>
                  <td className="p-4">
                    <ToggleSwitch
                      checked={errander.userId?.isBlacklisted || false}
                      onChange={() =>
                        handleBlacklist(errander, errander.userId?.isBlacklisted || false)
                      }
                      loading={loadingActions[`blacklist-${errander._id}`]}
                      label={errander.userId?.isBlacklisted ? "Blacklisted" : "Not Blacklisted"}
                    />
                  </td>
                  <td className="p-4">
                    <ToggleSwitch
                      checked={errander.userId?.isFeatured || false}
                      onChange={() =>
                        handleFeature(errander, errander.userId?.isFeatured || false)
                      }
                      loading={loadingActions[`feature-${errander._id}`]}
                      label={errander.userId?.isFeatured ? "Featured" : "Not Featured"}
                    />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedErrander(errander)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center"
                    >
                      <FaEye className="mr-2" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );

  const UsersContent = () => (
    <motion.div
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 bg-white rounded-lg shadow-md"
    >
       <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : users?.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-500 text-white">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Verified</th>
                <th className="p-4 text-left">Blacklisted</th>
                <th className="p-4 text-left">Featured</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((errander) => (
                <tr
                  key={errander._id}
                  className="border-b hover:bg-gray-50 transition duration-200"
                >
                  <td className="p-4">
                    {`${errander?.userId?.firstName || "N/A"} ${errander?.userId?.lastName || "N/A"}`}
                  </td>
                  <td className="p-4">{errander.userId?.email || "N/A"}</td>
                  <td className="p-4">
                    <ToggleSwitch
                      checked={errander.userId?.verificationStatus === "verified"}
                      onChange={() => handleVerify(errander)}
                      loading={loadingActions[`verify-${errander._id}`]}
                      label={
                        errander.userId?.verificationStatus === "verified"
                          ? "Verified"
                          : "Pending"
                      }
                    />
                  </td>
                  <td className="p-4">
                    <ToggleSwitch
                      checked={errander.userId?.isBlacklisted || false}
                      onChange={() =>
                        handleBlacklist(errander, errander.userId?.isBlacklisted || false)
                      }
                      loading={loadingActions[`blacklist-${errander._id}`]}
                      label={errander.userId?.isBlacklisted ? "Blacklisted" : "Not Blacklisted"}
                    />
                  </td>
                  <td className="p-4">
                    <ToggleSwitch
                      checked={errander.userId?.isFeatured || false}
                      onChange={() =>
                        handleFeature(errander, errander.userId?.isFeatured || false)
                      }
                      loading={loadingActions[`feature-${errander._id}`]}
                      label={errander.userId?.isFeatured ? "Featured" : "Not Featured"}
                    />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedErrander(errander)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center"
                    >
                      <FaEye className="mr-2" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
  

  const SettingsContent = () => (
    <motion.div
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <p className="text-gray-600">
        Manage your admin settings here. (Placeholder content)
      </p>
    </motion.div>
  );

  return (
    <div className="flex mt-12 bg-gray-100">
      {/* Sidebar */}
      <motion.div
        className="fixed top-0 left-0 h-full w-64 bg-green-500 text-white shadow-lg z-20 hidden md:block"
        initial={{ x: 0 }}
        animate={{ x: 0 }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center p-3 rounded-lg transition duration-300 ${
                activeTab === "dashboard" ? "bg-green-600" : "hover:bg-green-600"
              }`}
            >
              <FaTachometerAlt className="mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("erranders")}
              className={`w-full flex items-center p-3 rounded-lg transition duration-300 ${
                activeTab === "erranders" ? "bg-green-600" : "hover:bg-green-600"
              }`}
            >
              <FaUserCheck className="mr-3" />
              drivers
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center p-3 rounded-lg transition duration-300 ${
                activeTab === "users" ? "bg-green-600" : "hover:bg-green-600"
              }`}
            >
              <FaUsers className="mr-3" />
              Users
            </button>
            {/* <button
              onClick={() => setActiveTab("logout")}
              className={`w-full flex items-center p-3 rounded-lg transition duration-300 ${
                activeTab === "logout" ? "bg-green-600" : "hover:bg-green-600"
              }`}
            >
              <FaUsers className="mr-3" />
              Logout
            </button> */}
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center p-3 rounded-lg transition duration-300 ${
                activeTab === "settings" ? "bg-green-600" : "hover:bg-green-600"
              }`}
            >
              <FaCog className="mr-3" />
              Settings
            </button>
          </nav>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <motion.div
        className="fixed top-0 left-0 h-full w-64 bg-green-500 text-white shadow-lg z-20 md:hidden"
        initial="closed"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-2">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-3 rounded-lg transition duration-300 ${
                activeTab === "dashboard" ? "bg-green-600" : "hover:bg-green-600"
              }`}
            >
              <FaTachometerAlt className="mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab("erranders");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-3 rounded-lg transition duration-300 ${
                activeTab === "erranders" ? "bg-green-600" : "hover:bg-green-600"
              }`}
            >
              <FaUserCheck className="mr-3" />
              Erranders
            </button>
            <button
              onClick={() => {
                setActiveTab("users");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-3 rounded-lg transition duration-300 ${activeTab === "users" ? "bg-green-600" : "hover:bg-green-600"}`}>
              <FaUsers className="mr-3" />
              Users
            </button>
   
            <button
              onClick={() => {
                setActiveTab("settings");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-3 rounded-lg transition duration-300 ${
                activeTab === "settings" ? "bg-green-600" : "hover:bg-green-600"
              }`}
            >
              <FaCog className="mr-3" />
              Settings
            </button>
            {/* <Link to="/login">
             
            <button
              onClick={() => {
                setActiveTab("logout");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-3 rounded-lg transition duration-300 ${
                activeTab === "logout" ? "bg-red-600" : "hover:bg-red-600"
              }`}
            >
              <FaCog className="mr-3" />
              LogOut
            </button>
            </Link> */}

           
          </nav>
        </div>
      </motion.div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 p-6">
        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden mb-4">
          <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none">
            {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && <DashboardContent key="dashboard" />}
          {activeTab === "erranders" && <ErrandersContent key="erranders" />}
          {activeTab === "users" && <UsersContent key="users" />}
      
          {activeTab === "settings" && <SettingsContent key="settings" />}
          {/* {activeTab === "logout" && <Login key="logout" />} */}
        </AnimatePresence>
      </div>

      {/* Modal for viewing errander details */}
      <AnimatePresence>
        {selectedErrander && (
          <ErranderModal
            errander={selectedErrander}
            onClose={() => setSelectedErrander(null)}
          />
        )}
      </AnimatePresence>

      {/* Income Modal (Desktop) */}
      <AnimatePresence>
        {isModalOpen && selectedErrander && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <div className="bg-[#1C2526] rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white">
                  {selectedErrander.userId?.firstName}'s Income Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white text-xl focus:outline-none focus:ring-2 focus:ring-[#F4B400] rounded-md p-2 hover:text-[#F4B400] transition duration-300"
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>
              <p className="text-white mb-2">
                Comments: {selectedErrander.commentCount || 0}
              </p>
              <p className="text-white mb-2">
                Completed Errands: {selectedErrander.completedErrandsCount || 0}
              </p>
              <p className="text-white mb-2">
                Canceled Errands: {selectedErrander.canceledErrandsCount || 0}
              </p>
              <p className="text-white mb-2">
                Total Income: ₦{(selectedErrander.totalIncome || 0).toFixed(2)}
              </p>
              <p className="text-white mb-2">
                Platform Fee: ₦{(selectedErrander.platformFee || 0).toFixed(2)}
              </p>
              <p className="text-white mb-2">
                Income After Fee: ₦{(selectedErrander.incomeAfterFee || 0).toFixed(2)}
              </p>
              <button
                onClick={closeModal}
                className="mt-4 w-full py-2 px-4 bg-[#F4B400] text-[#1C2526] hover:bg-[#FFC107] rounded-lg font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#F4B400]"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;