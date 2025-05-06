import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaSpinner } from 'react-icons/fa';

const ReportDriver = ({ isDarkTheme }) => {
  const [formData, setFormData] = useState({
    driver: '',
    offence: '',
    observation: '',
    gradeOfOffence: '',
  });
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch drivers on mount
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/drivers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('Drivers response:', response.data);
        setDrivers(response.data.data || []);
      } catch (error) {
        console.error('Error fetching drivers:', error.response?.data || error);
        toast.error(error.response?.data?.message || 'Failed to fetch drivers', {
          style: { background: '#FF4444', color: 'white' },
        });
      } finally {
        setLoadingDrivers(false);
      }
    };
    fetchDrivers();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', { name, value });
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log('Updated formData:', updated);
      return updated;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    if (!formData.driver || !formData.offence || !formData.gradeOfOffence) {
      toast.error('Please fill all required fields', {
        style: { background: '#FF4444', color: 'white' },
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/createreport`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      console.log('Report response:', response.data);
      toast.success('Report submitted successfully', {
        style: { background: '#10B981', color: 'white' },
      });
      // Reset form
      setFormData({
        driver: '',
        offence: '',
        observation: '',
        gradeOfOffence: '',
      });
    } catch (error) {
      console.error('Error submitting report:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to submit report', {
        style: { background: '#FF4444', color: 'white' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`p-6 rounded-xl shadow-md ${
        isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
      } max-w-lg mx-auto`}
    >
      <h2 className="text-xl font-semibold mb-4">Submit a Report</h2>
      {loadingDrivers ? (
        <div className="flex items-center justify-center">
          <FaSpinner className="animate-spin text-2xl mr-2" />
          <span>Loading drivers...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Driver Dropdown */}
          <div>
            <label
              htmlFor="driver"
              className={`block text-sm font-medium ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Driver *
            </label>
            <select
              id="driver"
              name="driver"
              value={formData.driver}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border pointer-events-auto ${
                isDarkTheme
                  ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-800'
                  : 'bg-white border-gray-300 text-gray-800 focus:bg-white'
              } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              required
              aria-required="true"
            >
              <option value="">Select a driver</option>
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {(driver.user?.firstName || driver.firstName || 'Unknown')}{' '}
                    {(driver.user?.lastName || driver.lastName || '')} (
                    {driver.user?.email || driver.email || 'No email'})
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No drivers available
                </option>
              )}
            </select>
          </div>

          {/* Offence Input */}
          <div>
            <label
              htmlFor="offence"
              className={`block text-sm font-medium ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Offence *
            </label>
            <input
              type="text"
              id="offence"
              name="offence"
              value={formData.offence}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border pointer-events-auto ${
                isDarkTheme
                  ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-800'
                  : 'bg-white border-gray-300 text-gray-800 focus:bg-white'
              } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              placeholder="e.g., Late arrival"
              required
              aria-required="true"
            />
          </div>

          {/* Observation Textarea */}
          <div>
            <label
              htmlFor="observation"
              className={`block text-sm font-medium ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Observation
            </label>
            <textarea
              id="observation"
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border pointer-events-auto ${
                isDarkTheme
                  ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-800'
                  : 'bg-white border-gray-300 text-gray-800 focus:bg-white'
              } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              placeholder="Describe the incident (optional)"
              rows="4"
            />
          </div>

          {/* Grade of Offence Dropdown */}
          <div>
            <label
              htmlFor="gradeOfOffence"
              className={`block text-sm font-medium ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Grade of Offence *
            </label>
            <select
              id="gradeOfOffence"
              name="gradeOfOffence"
              value={formData.gradeOfOffence}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border pointer-events-auto ${
                isDarkTheme
                  ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-800'
                  : 'bg-white border-gray-300 text-gray-800 focus:bg-white'
              } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              required
              aria-required="true"
            >
              <option value="">Select grade</option>
              <option value="Minor">Minor</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
              isDarkTheme
                ? 'bg-GreenColor hover:bg-GreenColor'
                : 'bg-customGreen hover:bg-customGreen'
            } text-white font-semibold transition-colors ${
              submitting ? 'opacity-50 cursor-not-allowed' : 'pointer-events-auto'
            }`}
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReportDriver;