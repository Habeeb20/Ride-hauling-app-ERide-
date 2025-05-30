import {
  FaBell,
  FaSearch,
  FaCar,
  FaPlane,
  FaTruck,
  FaBus,
  FaTrailer,
  FaSuitcase,
  FaUser,
  FaRoute,
  FaCog,
  FaBars,
  FaEdit,
  FaSave,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaShieldAlt,
  FaCalendar,
  FaCalendarCheck
} from "react-icons/fa";
import  { useState, useEffect, useRef } from "react";
import {nigeriaAirportsByState} from "../../airportAndState.js"


  const Suggestions = () => {
      const [pickupModal, setPickupModals] = useState(false)
      const [loading, setLoading] = useState(false);
        const [showLorryModal, setShowLorryModal] = useState(false);
     const [pickup, setPickup] = useState({
    state:"",
    airportName:"",
    homeAddress:"",
    time:"",
    pickupOrdropoff: "",
    date:""
  })


    
 const suggestions = [

    { icon: FaPlane, label: "airport pickup", color: "bg-purple-100", onClick: () => setPickupModals(true)},
    { icon: FaPlane, label: "airport drop off", color: "bg-gray-100", onClick: () => setPickupModals(true) },
    { icon: FaTruck, label: 'pickup lorry', color: 'bg-blue-100', onClick: () => setShowLorryModal(true) },
    { icon: FaBus, label: "bus travel", color: "bg-yellow-100",  onClick: () => setShowLorryModal(true) },
    { icon: FaTruck, label: "pickup van", color: "bg-green-100",  onClick: () => setShowLorryModal(true) },
    { icon: FaTrailer, label: "pickup trailer", color: "bg-pink-100",  onClick: () => setShowLorryModal(true) },
  
  ];


    return (
      <div>
           <div className="bg-opacity-90 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl text-white font-semibold">Suggestions</h3>
                  <button className="text-sm text-e-ride-purple hover:underline">See all</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <button
                        key={index}
                        className={`${suggestion.color} p-4 rounded-lg flex items-center justify-center gap-2 text-gray-800 hover:shadow-md transition-shadow`}
                        onClick={suggestion.onClick}
                      >
                        <Icon size={24} />
                        <span className="text-sm font-medium">{suggestion.label}</span>
                      </button>
                    );
                  })}

{pickupModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[70vh] overflow-y-auto transform transition-all duration-300 hover:shadow-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Pick Up / Drop Off</h3>
              <button
                onClick={() => setPickupModals(false)}
                className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAirportPickup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                <select
                  value={pickup.pickupOrdropoff}
                  onChange={(e) => setPickup({ ...pickup, pickupOrdropoff: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-gray-800"
                  required
                >
                  <option value="">Select</option>
                  <option value="pickup">Pick Up</option>
                  <option value="dropoff">Drop Off</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pick Up/Drop Off Address</label>
                <input
                  type="text"
                  value={pickup.homeAddress}
                  onChange={(e) => setPickup({ ...pickup, homeAddress: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State (Destination)</label>
                <select
                  value={pickup.state}
                  onChange={(e) => setPickup({ ...pickup, state: e.target.value, airportName: "" })} // Reset airportName when state changes
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-gray-800"
                  required
                >
                  <option value="">Select a State</option>
                  {Object.keys(nigeriaAirportsByState).map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Airport</label>
                {/* Debugging log */}
                {console.log("Selected state:", pickup.state)}
                {console.log("Airports:", pickup.state ? nigeriaAirportsByState[pickup.state] : "No state selected")}
                <select
                  value={pickup.airportName}
                  onChange={(e) => setPickup({ ...pickup, airportName: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={!pickup.state}
                >
                  <option value="">Select an Airport</option>
                  {pickup.state &&
                    nigeriaAirportsByState[pickup.state].map((airport) => (
                      <option key={airport} value={airport}>
                        {airport}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={pickup.time}
                  onChange={(e) => setPickup({ ...pickup, time: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={pickup.date}
                  onChange={(e) => setPickup({ ...pickup, date: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-gray-800"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-customPink text-white rounded-lg font-semibold text-base tracking-tight hover:bg-activeColor text-black transition-all duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Posting..." : "Post Your Request"}
              </button>
            </form>
          </div>
        </div>
      )}
                </div>
              </div>
        
      </div>
    )
  }
  
  export default Suggestions
  