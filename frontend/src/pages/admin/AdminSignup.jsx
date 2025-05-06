
import { useState } from "react";
import { FaFacebookF, FaGoogle, FaTwitter, FaUserCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // For notifications
import axios from "axios";
import Navbar from "../../component/Navbar";
import im from "../../assets/Board Cover.jpg"; // Picture of a car
import { FaEye, FaEyeSlash } from 'react-icons/fa';
const AdminSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log("Sending registration request with:", { firstName, lastName, email, password });
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        {
          firstName,
          lastName,
          email,
          role,
          password,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.status) {
        localStorage.setItem("token", response.data.token);
        navigate(`/verifyemail?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`);
        toast.success("Registration successful! Redirecting to verify email...", {
          style: { background: "#4CAF50", color: "white" },
        });
      }
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: { background: "#F44336", color: "white" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    console.log(`Redirecting to ${provider} login...`);
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/${provider.toLowerCase()}`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-white px-4 mt-5 relative overflow-hidden">
        {/* Animated Car Background */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-car-cruise"
          style={{
            backgroundImage: `url(${im})`,
            opacity: 0.15, // Subtle to keep focus on the form
            zIndex: 0,
          }}
        ></div>

        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg relative z-10">
          <div className="flex flex-col items-center mb-6">
            <FaUserCheck size={64} className="text-customGray mb-2" />
            <h1 className="text-2xl font-bold text-gray-800">Register</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="w-full p-3 border border-activeColor rounded-full focus:outline-none focus:ring-2 focus:ring-custom"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="w-full p-3 border border-activeColor rounded-full focus:outline-none focus:ring-2 focus:ring-custom"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border border-activeColor rounded-full focus:outline-none focus:ring-2 focus:ring-custom"
                required
              />
             
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 border border-activeColor rounded-full focus:outline-none focus:ring-2 focus:ring-custom"
                required
              />
                {/* <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
             {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button> */}
           
            </div>
           
            <div className="flex space-x-4">
              <h4 className="font-bold">Role:</h4>
                 <label className="flex items-center">
                   <input
                     type="radio"
                     value="admin"
                     checked={role === "admin"}
                     onChange={(e) => setRole(e.target.value)}
                     className="mr-2"
                     disabled={loading}
                   />
                   Admin
                 </label>
            
              
               
               </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-customGreen text-white font-semibold rounded-full hover:from-purple-600 hover:to-e-ride-purple focus:outline-none focus:ring-2 focus:ring-e-ride-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "REGISTER"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">or connect with</p>
            <div className="flex justify-center space-x-4 mt-2">
              <button
                onClick={() => handleSocialClick("google")}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <FaGoogle size={20} />
              </button>
              <button
                onClick={() => handleSocialClick("facebook")}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaFacebookF size={20} />
              </button>
              <button
                onClick={() => handleSocialClick("twitter")}
                className="p-2 bg-sky-400 text-white rounded-full hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <FaTwitter size={20} />
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-e-ride-purple hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminSignup;