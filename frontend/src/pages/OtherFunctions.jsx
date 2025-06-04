import React from 'react';
import { useNavigate } from 'react-router-dom';

const handleLogout= () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
      >
        Log Out
      </button>
    </div>
  );
};

export default handleLogout
