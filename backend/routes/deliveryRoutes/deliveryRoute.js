import axios from "axios"
import dotenv from "dotenv"
import express from "express"


const deliveryRoute = express.Router()



deliveryRoute.post('/calculate-fare', async (req, res) => {
    const { pickupAddress, destinationAddress } = req.body;
    try {
        const apiKey = 'AIzaSyB58m9sAWsgdU4LjZO4ha9f8N11Px7aeps' 
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(pickupAddress)}&destinations=${encodeURIComponent(destinationAddress)}&units=metric&key=${apiKey}`;
    
        const response = await axios.get(url);
        const data = response.data;
        console.log('Google Maps API Response:', data);
    
        if (data.status !== 'OK') {
          return res.status(400).json({ status: false, message: `API Error: ${data.status}`, details: data.error_message || 'Unknown error' });
        }
    
        const element = data.rows[0]?.elements[0];
        if (!element || element.status !== 'OK') {
          return res.status(400).json({
            status: false,
            message: 'Unable to calculate distance',
            details: element?.status || 'No route data available',
          });
        }
    
        const distanceInMeters = element.distance.value;
        const distanceInKm = distanceInMeters / 1000;
    
        const baseFare = 500;
        const ratePerKm = 100;
        const fare = baseFare + distanceInKm * ratePerKm;


        console.log("results!!",    distanceInKm.toFixed(2),
          Math.round(fare), )
        return res.status(200).json({
          status: true,
          distance: distanceInKm.toFixed(2),
          price: Math.round(fare),
        });
      } catch (error) {
        console.error('Error calculating fare:', error.response?.data || error.message);
        return res.status(500).json({
          status: false,
          message: 'An error occurred while calculating fare',
          error: error.message,
        });
      }
  });
export default deliveryRoute