import React from 'react';

const FiltersContent = ({ isDarkTheme }) => (
  <div className={`p-4 rounded-lg shadow ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Filters</h2>
      <button className={`text-sm ${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-customGreen hover:underline'}`}>
        Reset All
      </button>
    </div>
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Select Brand</label>
        <select className={`w-full border rounded py-2 px-3 text-sm focus:outline-none focus:ring-2 ${isDarkTheme ? 'bg-gray-800 text-white border-gray-600 focus:ring-gray-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-customGreen'}`}>
          <option>Select Brand</option>
          <option>BMW</option>
          <option>Mercedes</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Select Model</label>
        <select className={`w-full border rounded py-2 px-3 text-sm focus:outline-none focus:ring-2 ${isDarkTheme ? 'bg-gray-800 text-white border-gray-600 focus:ring-gray-500' : 'bg-white text-gray-800 border-gray-300 focus:ring-customGreen'}`}>
          <option>Select Model</option>
          <option>Model 1</option>
          <option>Model 2</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Price Range</label>
        <input type="range" min="50000" max="200000" className="w-full" />
        <div className={`flex justify-between text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>
          <span>50,000</span>
          <span>200,000</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Type</label>
        <div className="flex flex-wrap gap-2">
          <button className={`px-3 py-1 border rounded ${isDarkTheme ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-800 border-gray-300 hover:bg-green-100'}`}>
            Sedan
          </button>
          <button className={`px-3 py-1 border rounded ${isDarkTheme ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-800 border-gray-300 hover:bg-green-100'}`}>
            Crossover
          </button>
          <button className={`px-3 py-1 border rounded ${isDarkTheme ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-800 border-gray-300 hover:bg-green-100'}`}>
            Coupe
          </button>
          <button className={`px-3 py-1 border rounded ${isDarkTheme ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-800 border-gray-300 hover:bg-green-100'}`}>
            SUV
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Colors</label>
        <div className="flex gap-2">
          <button className="w-8 h-8 bg-red-500 rounded-full hover:scale-110 transition"></button>
          <button className="w-8 h-8 bg-blue-500 rounded-full hover:scale-110 transition"></button>
          <button className="w-8 h-8 bg-green-500 rounded-full hover:scale-110 transition"></button>
          <button className="w-8 h-8 bg-black rounded-full hover:scale-110 transition"></button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Release Year</label>
        <input type="range" min="2020" max="2024" className="w-full" />
        <div className={`flex justify-between text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>
          <span>2020</span>
          <span>2024</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Showroom Location</label>
        <div className={`h-32 rounded flex items-center justify-center ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>Map Placeholder</p>
        </div>
      </div>
    </div>
  </div>
);

export default FiltersContent;