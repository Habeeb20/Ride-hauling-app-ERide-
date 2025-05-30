import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Intro = () => {
  const navigate = useNavigate();

  const sidebarItems = [
    { name: 'Book a Ride', path: '/clientdashboard' },
    { name: 'Ride History', path: '/clientdashboard' },
    { name: 'Profile', path: '/clientdashboard' },
    { name: 'Payments', path: '/clientdashboard' },
    { name: 'Support', path: '/clientdashboard' },
  ];

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src="https://img.icons8.com/?size=100&id=103135&format=png&color=000000"
          alt="Moving car"
          className="w-24 h-24 object-contain"
          animate={{ x: ['-100vw', '100vw'] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        />
      </div>
      <motion.button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <XMarkIcon className="w-6 h-6" />
      </motion.button>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 max-w-3xl"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-GreenColor mb-4">
            Welcome to <span className="text-customGreen">E-Ride</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700">
            <span className="text-customGreen font-semibold">E-Ride</span> is your trusted ride-hailing app, connecting you with reliable drivers in seconds. Whether you’re heading to work, meeting friends, or exploring the city, our seamless booking process, real-time tracking, and secure payments make every journey effortless. Choose from a variety of ride options tailored to your needs and enjoy a safe, comfortable experience. Join thousands of riders and drivers transforming urban mobility with <span className="text-customGreen font-semibold">E-Ride</span>!
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05, backgroundColor: '#0D842A' }}
              onClick={() => navigate(item.path)}
              className="bg-customGreen p-6 rounded-lg shadow-md border border-GreenColor hover:bg-altGreen cursor-pointer flex items-center justify-center text-center transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold text-GreenColor">{item.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Intro;