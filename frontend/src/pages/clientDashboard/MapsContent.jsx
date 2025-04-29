import React from 'react';

const MapContent = ({ isDarkTheme }) => (
  <div className={`p-4 rounded-lg shadow ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
    <h2 className="text-xl font-bold mb-4">Showroom Locations</h2>
    <div className={`h-64 rounded flex items-center justify-center ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>Map Placeholder (Showroom Locations)</p>
    </div>
  </div>
);

export default MapContent;