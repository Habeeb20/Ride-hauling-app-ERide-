import { useState, useEffect } from 'react';
import { FaCar, FaCheckCircle, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'sonner';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const RideStatistics = ({ isDarkTheme }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rides/ride-statistics`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStats(response.data.data);
        console.log('Ride statistics:', response.data.data);
      } catch (error) {
        console.error('Error fetching ride statistics:', error.response?.data || error);
        toast.error(error.response?.data?.message || 'Failed to fetch ride statistics', {
          style: { background: '#FF4444', color: 'white' },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-center text-red-500">No statistics available</div>;
  }

  // Compute client amount metrics
  const clientTotalAmount =
    (stats.clients?.pending?.totalAmount || 0) +
    (stats.clients?.completed?.totalAmount || 0) +
    (stats.clients?.cancelled?.totalAmount || 0);
  const clientMaxAmount = clientTotalAmount || 1; // Avoid division by zero
  const clientStatsFormatted = {
    totalAmount: clientTotalAmount,
    completedAmount: stats.clients?.completed?.totalAmount || 0,
    pendingAmount: stats.clients?.pending?.totalAmount || 0,
    cancelledAmount: stats.clients?.cancelled?.totalAmount || 0,
  };

  // Compute client count metrics
  const clientTotalBookings =
    (stats.clients?.pending?.count || 0) +
    (stats.clients?.completed?.count || 0) +
    (stats.clients?.cancelled?.count || 0);
  const clientMaxBookings = clientTotalBookings || 1; // Avoid division by zero
  const clientStatsFormatted1 = {
    totalBookings: clientTotalBookings,
    completedRides: stats.clients?.completed?.count || 0,
    pendingBookings: stats.clients?.pending?.count || 0,
    cancelledBookings: stats.clients?.cancelled?.count || 0,
  };

  // Compute driver amount metrics
  const driverTotalAmount =
    (stats.drivers?.pending?.totalAmount || 0) +
    (stats.drivers?.completed?.totalAmount || 0) +
    (stats.drivers?.cancelled?.totalAmount || 0);
  const driverMaxAmount = driverTotalAmount || 1; // Avoid division by zero
  const driverStatsFormatted = {
    totalAmount: driverTotalAmount,
    completedAmount: stats.drivers?.completed?.totalAmount || 0,
    pendingAmount: stats.drivers?.pending?.totalAmount || 0,
    cancelledAmount: stats.drivers?.cancelled?.totalAmount || 0,
  };

  // Compute driver count metrics
  const driverTotalRides =
    (stats.drivers?.pending?.count || 0) +
    (stats.drivers?.completed?.count || 0) +
    (stats.drivers?.cancelled?.count || 0);
  const driverMaxRides = driverTotalRides || 1; // Avoid division by zero
  const driverStatsFormatted1 = {
    totalRides: driverTotalRides,
    completedRides: stats.drivers?.completed?.count || 0,
    pendingRides: stats.drivers?.pending?.count || 0,
    cancelledRides: stats.drivers?.cancelled?.count || 0,
  };

  // Doughnut chart data
  const chartOptions = {
    cutout: '70%',
    plugins: { legend: { display: false } },
  };

  const totalAmountData = {
    labels: ['Total', 'Remaining'],
    datasets: [
      {
        data: [clientStatsFormatted.totalAmount, clientMaxAmount - clientStatsFormatted.totalAmount],
        backgroundColor: [isDarkTheme ? '#60A5FA' : '#3B82F6', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const completedAmountData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [clientStatsFormatted.completedAmount, clientMaxAmount - clientStatsFormatted.completedAmount],
        backgroundColor: [isDarkTheme ? '#34D399' : '#10B981', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const pendingAmountData = {
    labels: ['Pending', 'Remaining'],
    datasets: [
      {
        data: [clientStatsFormatted.pendingAmount, clientMaxAmount - clientStatsFormatted.pendingAmount],
        backgroundColor: [isDarkTheme ? '#FBBF24' : '#F59E0B', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const cancelledAmountData = {
    labels: ['Cancelled', 'Remaining'],
    datasets: [
      {
        data: [clientStatsFormatted.cancelledAmount, clientMaxAmount - clientStatsFormatted.cancelledAmount],
        backgroundColor: [isDarkTheme ? '#F87171' : '#EF4444', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const totalBookingsData = {
    labels: ['Booked', 'Remaining'],
    datasets: [
      {
        data: [clientStatsFormatted1.totalBookings, clientMaxBookings - clientStatsFormatted1.totalBookings],
        backgroundColor: [isDarkTheme ? '#60A5FA' : '#3B82F6', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const completedRidesData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [clientStatsFormatted1.completedRides, clientMaxBookings - clientStatsFormatted1.completedRides],
        backgroundColor: [isDarkTheme ? '#34D399' : '#10B981', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const pendingBookingsData = {
    labels: ['Pending', 'Remaining'],
    datasets: [
      {
        data: [clientStatsFormatted1.pendingBookings, clientMaxBookings - clientStatsFormatted1.pendingBookings],
        backgroundColor: [isDarkTheme ? '#FBBF24' : '#F59E0B', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const cancelledBookingsData = {
    labels: ['Cancelled', 'Remaining'],
    datasets: [
      {
        data: [clientStatsFormatted1.cancelledBookings, clientMaxBookings - clientStatsFormatted1.cancelledBookings],
        backgroundColor: [isDarkTheme ? '#F87171' : '#EF4444', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const driverTotalAmountData = {
    labels: ['Total', 'Remaining'],
    datasets: [
      {
        data: [driverStatsFormatted.totalAmount, driverMaxAmount - driverStatsFormatted.totalAmount],
        backgroundColor: [isDarkTheme ? '#60A5FA' : '#3B82F6', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const driverCompletedAmountData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [driverStatsFormatted.completedAmount, driverMaxAmount - driverStatsFormatted.completedAmount],
        backgroundColor: [isDarkTheme ? '#34D399' : '#10B981', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const driverPendingAmountData = {
    labels: ['Pending', 'Remaining'],
    datasets: [
      {
        data: [driverStatsFormatted.pendingAmount, driverMaxAmount - driverStatsFormatted.pendingAmount],
        backgroundColor: [isDarkTheme ? '#FBBF24' : '#F59E0B', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const driverCancelledAmountData = {
    labels: ['Cancelled', 'Remaining'],
    datasets: [
      {
        data: [driverStatsFormatted.cancelledAmount, driverMaxAmount - driverStatsFormatted.cancelledAmount],
        backgroundColor: [isDarkTheme ? '#F87171' : '#EF4444', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const driverTotalRidesData = {
    labels: ['Rides', 'Remaining'],
    datasets: [
      {
        data: [driverStatsFormatted1.totalRides, driverMaxRides - driverStatsFormatted1.totalRides],
        backgroundColor: [isDarkTheme ? '#60A5FA' : '#3B82F6', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const driverCompletedRidesData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [driverStatsFormatted1.completedRides, driverMaxRides - driverStatsFormatted1.completedRides],
        backgroundColor: [isDarkTheme ? '#34D399' : '#10B981', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const driverPendingRidesData = {
    labels: ['Pending', 'Remaining'],
    datasets: [
      {
        data: [driverStatsFormatted1.pendingRides, driverMaxRides - driverStatsFormatted1.pendingRides],
        backgroundColor: [isDarkTheme ? '#FBBF24' : '#F59E0B', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  const driverCancelledRidesData = {
    labels: ['Cancelled', 'Remaining'],
    datasets: [
      {
        data: [driverStatsFormatted1.cancelledRides, driverMaxRides - driverStatsFormatted1.cancelledRides],
        backgroundColor: [isDarkTheme ? '#F87171' : '#EF4444', isDarkTheme ? '#4B5563' : '#E5E7EB'],
      },
    ],
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Client Statistics */}
      <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-800'} mb-4`}>Client Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}
          aria-label="Total Client Amount and Bookings"
        >
          <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Total Amount & Bookings</p>
          <div className="flex items-center mb-4">
            <div className="p-4 bg-blue-100 rounded-lg mr-4">
              <FaCar className="text-blue-600 text-2xl" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                N{clientStatsFormatted.totalAmount.toFixed(2)}
              </p>
              <p className={`text-xl ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {clientStatsFormatted1.totalBookings} Bookings
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round((clientStatsFormatted.totalAmount / clientMaxAmount) * 100)}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut data={totalAmountData} options={chartOptions} />
              </div>
            </div>
            <div>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round((clientStatsFormatted1.totalBookings / clientMaxBookings) * 100)}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut data={totalBookingsData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
        <div
          className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}
          aria-label="Completed Client Rides Amount"
        >
          <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Completed Rides Amount</p>
          <div className="flex items-center mb-4">
            <div className="p-4 bg-green-100 rounded-lg mr-4">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                N{clientStatsFormatted.completedAmount.toFixed(2)}
              </p>
              <p className={`text-xl ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {clientStatsFormatted1.completedRides} Rides
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round((clientStatsFormatted.completedAmount / clientMaxAmount) * 100)}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut data={completedAmountData} options={chartOptions} />
              </div>
            </div>
            <div>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round((clientStatsFormatted1.completedRides / clientMaxBookings) * 100)}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut data={completedRidesData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
        <div
          className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}
          aria-label="Pending Client Rides Amount"
        >
          <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Pending Rides Amount</p>
          <div className="flex items-center mb-4">
            <div className="p-4 bg-yellow-100 rounded-lg mr-4">
              <FaCar className="text-yellow-600 text-2xl" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                N{clientStatsFormatted.pendingAmount.toFixed(2)}
              </p>
              <p className={`text-xl ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {clientStatsFormatted1.pendingBookings} Bookings
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round((clientStatsFormatted.pendingAmount / clientMaxAmount) * 100)}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut data={pendingAmountData} options={chartOptions} />
              </div>
            </div>
            <div>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round((clientStatsFormatted1.pendingBookings / clientMaxBookings) * 100)}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut data={pendingBookingsData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
        <div
          className={`p-6 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}
          aria-label="Cancelled Client Rides Amount"
        >
          <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Cancelled Rides Amount</p>
          <div className="flex items-center mb-4">
            <div className="p-4 bg-red-100 rounded-lg mr-4">
              <FaChartBar className="text-red-600 text-2xl" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                N{clientStatsFormatted.cancelledAmount.toFixed(2)}
              </p>
              <p className={`text-xl ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {clientStatsFormatted1.cancelledBookings} Bookings
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round((clientStatsFormatted.cancelledAmount / clientMaxAmount) * 100)}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut data={cancelledAmountData} options={chartOptions} />
              </div>
            </div>
            <div>
              <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round((clientStatsFormatted1.cancelledBookings / clientMaxBookings) * 100)}%
              </p>
              <div className="mt-4 w-16 h-16">
                <Doughnut data={cancelledBookingsData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

 
    </div>
  );
};

export default RideStatistics;