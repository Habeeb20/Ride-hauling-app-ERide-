import express from "express";
import Ride from "../../model/ride/rideSchema.js";
import Profile from "../../model/auth/profileSchema.js";
import User from "../../model/auth/authSchema.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const erideRouter = express.Router();

export default (io) => {
  async function geocodeAddress(address) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { "User-Agent": "e_RideProject/1.0" } }
      );
      const data = response.data[0];
      return { lat: parseFloat(data.lat), lng: parseFloat(data.lon) };
    } catch (error) {
      console.error("Geocoding error:", error.message);
      return null;
    }
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calculateETA(distance, averageSpeedKmPerHour = 40) {
    const timeHours = distance / averageSpeedKmPerHour;
    return Math.round(timeHours * 60); // Convert to minutes
  }




  erideRouter.post('/calculate-fare', async (req, res) => {
    const { pickupAddress, destinationAddress, rideOption } = req.body;
    if (!pickupAddress || !destinationAddress || !rideOption) {
      return res.status(400).json({ status: false, error: 'Missing required fields: pickupAddress, destinationAddress, rideOption' });
    }
    if (!['economy', 'premium', 'shared'].includes(rideOption)) {
      return res.status(400).json({ status: false, error: 'Invalid rideOption' });
    }
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyB58m9sAWsgdU4LjZO4ha9f8N11Px7aeps'; 
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(pickupAddress)}&destinations=${encodeURIComponent(destinationAddress)}&units=metric&key=${apiKey}`;
  
      const response = await axios.get(url);
      const data = response.data;
      console.log('Google Maps API Response:', data);
  
      if (data.status !== 'OK') {
        return res.status(400).json({
          status: false,
          error: `API Error: ${data.status}`,
          details: data.error_message || 'Unknown error',
        });
      }
  
      const element = data.rows[0]?.elements[0];
      if (!element || element.status !== 'OK') {
        return res.status(400).json({
          status: false,
          error: 'Unable to calculate distance',
          details: element?.status || 'No route data available',
        });
      }
  
      const distanceInMeters = element.distance.value;
      const distanceInKm = distanceInMeters / 1000;
  
      const baseFare = 500;
      const ratePerKm = 100;
      let fare = baseFare + distanceInKm * ratePerKm;
  
      // Apply rideOption multipliers
      if (rideOption === 'premium') fare *= 1.5;
      if (rideOption === 'shared') fare *= 0.7;
  
      console.log('Results:', {
        distance: distanceInKm.toFixed(2),
        calculatedPrice: Math.round(fare),
        rideOption,
      });
  
      return res.status(200).json({
        status: true,
        distance: distanceInKm.toFixed(2),
        calculatedPrice: Math.round(fare),
      });
    } catch (error) {
      console.error('Error calculating fare:', error.response?.data || error.message);
      return res.status(500).json({
        status: false,
        error: 'An error occurred while calculating fare',
        details: error.message,
      });
    }
  });





  erideRouter.post("/create", verifyToken, async (req, res) => {
    const passengerId = req.user?.id || req.user?._id;
    const { pickupAddress, destinationAddress, passengerNum, rideOption, paymentMethod, desiredPrice } = req.body;
  
    try {
      if (!pickupAddress || !destinationAddress || !passengerNum || !rideOption || !paymentMethod) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const user = await User.findById(passengerId);
      if (!user || user.role !== "client") {
        return res.status(403).json({ error: "Invalid passenger" });
      }
  
      const passenger = await Profile.findOne({ userId: user._id });
      if (!passenger) {
        return res.status(404).json({ error: "Profile not found" });
      }
  
      const pickupCoordinates = await geocodeAddress(pickupAddress);
      const destinationCoordinates = await geocodeAddress(destinationAddress);
      if (!pickupCoordinates || !destinationCoordinates) {
        return res.status(400).json({ error: "Failed to geocode addresses" });
      }
  
      const distance = calculateDistance(
        pickupCoordinates.lat,
        pickupCoordinates.lng,
        destinationCoordinates.lat,
        destinationCoordinates.lng
      );
      const calculatedPrice = Math.round(distance * 200);
  
      const ride = new Ride({
        clientId: user._id,
        client: passenger._id,
        pickupAddress,
        destinationAddress,
        pickupCoordinates,
        destinationCoordinates,
        distance,
        passengerNum,
        calculatedPrice,
        desiredPrice: desiredPrice || calculatedPrice,
        rideOption,
        paymentMethod,
        status: "pending",
      });
      await ride.save();
  
      const rideData = {
        _id: ride._id,
        clientId: { firstName: user.firstName, lastName: user.lastName, email: user.email },
        client: {
          _id: passenger._id,
          phoneNumber: passenger.phoneNumber,
          profilePicture: passenger.profilePicture,
        },
        pickupAddress,
        destinationAddress,
        distance,
        passengerNum,
        calculatedPrice,
        desiredPrice: ride.desiredPrice,
        rideOption,
        paymentMethod,
        pickupCoordinates,
        destinationCoordinates,
        status: ride.status,
        createdAt: ride.createdAt,
      };
  
      io.emit("newRideAvailable", rideData);
      const nearbyDrivers = await Profile.find({}); // Adjust to filter drivers if needed
      nearbyDrivers.forEach((driver) => {
        io.to(driver._id.toString()).emit("newRideRequest", rideData);
      });
  
      res.status(201).json({ message: "Ride created", ride: rideData });
    } catch (error) {
      console.error("Error creating ride:", error.message);
      res.status(500).json({ error: "Failed to create ride" });
    }
  });




  erideRouter.get("/available", verifyToken, async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user?.id || req.user?._id });
      if (!user || user.role !== "driver") {
        return res.status(403).json({ error: "Invalid driver" });
      }
  
      const driver = await Profile.findOne({ userId: user._id });
      if (!driver) {
        return res.status(404).json({ error: "Profile not found" });
      }
  
      const rides = await Ride.find({ status: "pending", driverId: null })
        .populate("client", "phoneNumber profilePicture")
        .populate("clientId", "firstName lastName email")
        .populate("driverOffers.driver", "firstName lastName profilePicture carDetails phoneNumber rating")
        .populate('interestedDrivers.driverId', 'firstName lastName phoneNumber profilePicture')
        .sort({ createdAt: -1 });
  
      const nearbyRides = await Promise.all(
        rides.map(async (ride) => {
          if (!driver.location || !ride.pickupCoordinates) return null;
  
          // Check if driver and client are in the same state
          const clientProfile = await Profile.findOne({ userId: ride.clientId._id });
          if (!clientProfile || clientProfile.location.state !== driver.location.state) {
            return null;
          }
  
          // Calculate driving time using Google Maps Distance Matrix API
          try {
            const distanceMatrixResponse = await axios.get(
              `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${driver.location.coordinates.lat},${driver.location.coordinates.lng}&destinations=${ride.pickupCoordinates.lat},${ride.pickupCoordinates.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
            );
  
            const duration = distanceMatrixResponse.data.rows[0].elements[0].duration?.value; // Duration in seconds
            if (!duration || duration / 60 > 20) {
              return null; // Exclude rides with driving time > 20 minutes
            }
          } catch (apiError) {
            console.error("Error fetching driving time:", apiError.message);
            return null; // Skip ride if API call fails
          }
  
          return {
            _id: ride._id,
            pickupAddress: ride.pickupAddress,
            destinationAddress: ride.destinationAddress,
            distance: ride.distance,
            passengerNum: ride.passengerNum,
            calculatedPrice: ride.calculatedPrice,
            desiredPrice: ride.desiredPrice,
            rideOption: ride.rideOption,
            paymentMethod: ride.paymentMethod,
            pickupCoordinates: ride.pickupCoordinates,
            destinationCoordinates: ride.destinationCoordinates,
            client: {
              _id: ride.client._id,
              firstName: ride.clientId.firstName,
              lastName: ride.clientId.lastName,
              email: ride.clientId.email,
              phoneNumber: ride.client.phoneNumber,
              profilePicture: ride.client.profilePicture,
            },
            createdAt: ride.createdAt,
          };
        })
      );
  
      // Filter out null values (rides that didn't meet criteria)
      const filteredRides = nearbyRides.filter((ride) => ride !== null);
  
      res.status(200).json(rides); // Send filtered rides
    } catch (error) {
      console.error("Error fetching available rides:", error.message);
      res.status(500).json({ error: "Failed to fetch available rides" });
    }
  });




  // // Driver submits an offer (accept or negotiate)
  // erideRouter.post("/:rideId/offer", verifyToken, async (req, res) => {
  //   try {
  //     const { offeredPrice } = req.body;
  //     const user = await User.findOne({ _id: req.user?.id || req.user?._id });
  //     if (!user || user.role !== "driver") {
  //       return res.status(403).json({ error: "Invalid driver" });
  //     }
  
  //     const ride = await Ride.findById(req.params.rideId);
  //     if (!ride || ride.status !== "pending" || ride.driverId) {
  //       return res.status(400).json({ error: "Ride not available" });
  //     }
  
  //     const driver = await Profile.findOne({ userId: user._id });
  //     if (!driver) {
  //       return res.status(404).json({ error: "Driver profile not found" });
  //     }
  
  //     // Validate offeredPrice
  //     if (!offeredPrice || isNaN(parseFloat(offeredPrice)) || parseFloat(offeredPrice) <= 0) {
  //       return res.status(400).json({ error: "Invalid offered price" });
  //     }
  
  //     // Update ride with driver's offer
  //     ride.driverOffers = ride.driverOffers || [];
  //     ride.driverOffers.push({
  //       driver: user._id, // Use ObjectId reference
  //       offeredPrice: parseFloat(offeredPrice),
  //       status: "pending",
  //     });
  
  //     await ride.save();
      
  //     // Emit Socket.IO event to client
  //     const io = req.app.get('socketio');
  //     io.to(ride.clientId.toString()).emit("driverOffer", {
  //       rideId: ride._id,
  //       driver: {
  //         _id: user._id,
  //         firstName: driver.userId.firstName,
  //         lastName: driver.userId.lastName,
  //         profilePicture: driver.profilePicture,
  //         carDetails: driver.carDetails,
  //         phoneNumber: driver.phoneNumber,
  //         rating: driver.rating,
  //         distance: "5 km", // Replace with actual calculation
  //       },
  //       offeredPrice: parseFloat(offeredPrice),
   
  //       status: "pending",
  //     });
  
    
  
  //     res.status(200).json({ message: "Offer submitted successfully" });
  //   } catch (error) {
  //     console.error("Error submitting offer:", error.message);
  //     res.status(500).json({ error: "Failed to submit offer" });
  //   }
  // });

  // erideRouter.post("/:rideId/reject", verifyToken, async (req, res) => {
  //   try {
  //     const user = await User.findOne({ _id: req.user?.id || req.user?._id });
  //     if (!user || user.role !== "driver") {
  //       return res.status(403).json({ error: "Invalid driver" });
  //     }
  
  //     const ride = await Ride.findById(req.params.rideId);
  //     if (!ride || ride.status !== "pending" || ride.driverId) {
  //       return res.status(400).json({ error: "Ride not available" });
  //     }
  
  //     // Mark offer as rejected (if tracking offers)
  //     ride.offers = ride.driverOffers || [];
  //     ride.offers.push({
  //       driverId: user._id,
  //       offeredPrice: null,
  //       status: "rejected",
  //     });
  
  //     await ride.save();
  
  //     // Emit Socket.IO event to client
  //     const io = req.app.get('socketio');
  //     io.to(ride.clientId.toString()).emit("driverRejected", {
  //       rideId: ride._id,
  //       driverId: user._id,
  //     });
  
  //     res.status(200).json({ message: "Ride rejected successfully" });
  //   } catch (error) {
  //     console.error("Error rejecting ride:", error.message);
  //     res.status(500).json({ error: "Failed to reject ride" });
  //   }
  // });






erideRouter.post('/:rideId/emergency', async (req, res) => {
  try {
    const { rideId } = req.params;
    // Logic to handle emergency (e.g., notify authorities)
    io.to(rideId).emit('emergencyReported', { rideId });
    res.status(200).json({ status: true, message: 'Emergency reported' });
  } catch (error) {
    console.error('Emergency error:', error);
    res.status(500).json({ error: 'Failed to report emergency' });
  }
});















  

// Driver submits an offer (accept or negotiate)
erideRouter.post('/:rideId/offer', verifyToken, async (req, res) => {
  try {
    const { offeredPrice, action } = req.body; // Action: 'accepted' or 'negotiated'
    const user = await User.findOne({ _id: req.user?.id || req.user?._id });
    if (!user || user.role !== 'driver') {
      return res.status(403).json({ error: 'Invalid driver' });
    }

    const ride = await Ride.findById(req.params.rideId).populate('clientId', 'firstName lastName email phoneNumber profilePicture');
    if (!ride || ride.status !== 'pending' || ride.driverId) {
      return res.status(400).json({ error: 'Ride not available' });
    }

    const driver = await Profile.findOne({ userId: user._id });
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    // Check if driver has already acted
    const hasActed = ride.driverOffers.some((offer) => offer.driver.toString() === user._id.toString());
    if (hasActed) {
      return res.status(400).json({ error: 'You have already acted on this ride' });
    }

    // Validate action and offeredPrice
    if (!['accepted', 'negotiated'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    if (!offeredPrice || isNaN(parseFloat(offeredPrice)) || parseFloat(offeredPrice) <= 0) {
      return res.status(400).json({ error: 'Invalid offered price' });
    }
    if (action === 'accepted' && parseFloat(offeredPrice) !== ride.calculatedPrice) {
      return res.status(400).json({ error: 'Offered price must match calculated price for acceptance' });
    }

    // Update ride with driver's offer
    ride.driverOffers = ride.driverOffers || [];
    ride.driverOffers.push({
      driver: user._id,
      offeredPrice: parseFloat(offeredPrice),
      status: 'pending',
    });

    // Add to interestedDrivers
    ride.interestedDrivers = ride.interestedDrivers || [];
    ride.interestedDrivers.push({
      driverId: user._id,
      action,
      offeredPrice: parseFloat(offeredPrice),
      timestamp: new Date(),
    });

    await ride.save();

    // Emit Socket.IO event to client
    const io = req.app.get('socketio');
    io.to(ride.clientId.toString()).emit('driverOffer', {
      rideId: ride._id,
      driver: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: driver.profilePicture,
        carDetails: driver.carDetails,
        phoneNumber: user.phoneNumber,
        rating: driver.rating,
        distance: calculateDistance(driver, ride), // Replace with actual calculation
      },
      offeredPrice: parseFloat(offeredPrice),
      action, // Include action for frontend
      status: 'pending',
    });

    res.status(200).json({ message: 'Offer submitted successfully' });
  } catch (error) {
    console.error('Error submitting offer:', error.message);
    res.status(500).json({ error: 'Failed to submit offer' });
  }
});

// Driver rejects a ride
erideRouter.post('/:rideId/reject', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user?.id || req.user?._id });
    if (!user || user.role !== 'driver') {
      return res.status(403).json({ error: 'Invalid driver' });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride || ride.status !== 'pending' || ride.driverId) {
      return res.status(400).json({ error: 'Ride not available' });
    }

    // Check if driver has already acted
    const hasActed = ride.driverOffers.some((offer) => offer.driver.toString() === user._id.toString());
    if (hasActed) {
      return res.status(400).json({ error: 'You have already acted on this ride' });
    }

    // Add rejection to driverOffers
    ride.driverOffers = ride.driverOffers || [];
    ride.driverOffers.push({
      driver: user._id,
      offeredPrice: null, // Allowed by schema
      status: 'rejected',
    });

    // Add to interestedDrivers
    ride.interestedDrivers = ride.interestedDrivers || [];
    ride.interestedDrivers.push({
      driverId: user._id,
      action: 'rejected',
      offeredPrice: null,
      timestamp: new Date(),
    });

    await ride.save();

    // Emit Socket.IO event to driver (not client)
    const io = req.app.get('socketio');
    io.to(user._id.toString()).emit('driverRejected', {
      rideId: ride._id,
    });

    res.status(200).json({ message: 'Ride rejected successfully' });
  } catch (error) {
    console.error('Error rejecting ride:', error.message);
    res.status(500).json({ error: 'Failed to reject ride' });
  }
});






  // Driver starts the ride
  erideRouter.put("/:rideId/start", verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const driverId = req.user?.id || req.user?._id; 

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || ride.driverId.toString() !== driverId || ride.status !== "accepted") {
        return res.status(400).json({ error: "Invalid ride or driver" });
      }

      ride.status = "in_progress";
      ride.rideStartTime = new Date();
      await ride.save();

      io.to(ride._id.toString()).emit("rideStarted", {
        rideId,
        passengerId: ride.client.toString(),
        driverId,
        startTime: ride.rideStartTime,
      });

      res.status(200).json({ message: "Ride started", ride });
    } catch (error) {
      console.error("Error starting ride:", error.message);
      res.status(500).json({ error: "Failed to start ride" });
    }
  });

  // Driver completes the ride
  erideRouter.put("/:rideId/complete", verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const driverId = req.user.id;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || ride.driverId.toString() !== driverId || ride.status !== "in_progress") {
        return res.status(400).json({ error: "Invalid ride or driver" });
      }

      ride.status = "completed";
      ride.rideEndTime = new Date();
      ride.rideDuration = Math.round((ride.rideEndTime - ride.rideStartTime) / 60000);
      await ride.save();

      const driverProfile = await Profile.findById(ride.driver);
      driverProfile.rideCount = (driverProfile.rideCount || 0) + 1;
      await driverProfile.save();

      io.to(ride._id.toString()).emit("rideCompleted", {
        rideId,
        rideDuration: ride.rideDuration,
        passengerId: ride.client.toString(),
        driverId,
      });

      res.status(200).json({ message: "Ride completed", rideDuration: ride.rideDuration, ride });
    } catch (error) {
      console.error("Error completing ride:", error.message);
      res.status(500).json({ error: "Failed to complete ride" });
    }
  });

  // Client or driver cancels the ride
  erideRouter.post("/:rideId/cancel", verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride) return res.status(404).json({ error: "Ride not found" });

      const passengerProfile = await Profile.findOne({ userId });
      const isPassenger = ride.client.toString() === passengerProfile?._id.toString();
      const isDriver = ride.driverId?.toString() === userId;

      if (!isPassenger && !isDriver) {
        return res.status(403).json({ error: "Unauthorized to cancel this ride" });
      }

      if (ride.status === "completed" || ride.status === "cancelled") {
        return res.status(400).json({ error: "Ride cannot be cancelled" });
      }

      ride.status = "cancelled";
      ride.cancelReason = reason || "No reason provided";
      await ride.save();

      io.to(ride._id.toString()).emit("rideCancelled", {
        rideId,
        cancelledBy: isPassenger ? "passenger" : "driver",
        passengerId: ride.client.toString(),
        driverId: ride.driverId?.toString(),
        reason: ride.cancelReason,
      });
      io.emit("rideStatusUpdate", { rideId, status: "cancelled" });

      res.status(200).json({ message: "Ride cancelled", ride });
    } catch (error) {
      console.error("Error cancelling ride:", error.message);
      res.status(500).json({ error: "Failed to cancel ride" });
    }
  });

  // Update driver location
  erideRouter.post("/:rideId/update-location", verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const { lat, lng } = req.body;
    const userId = req.user?.id || req.user?._id; 

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || !ride.driverId) return res.status(404).json({ error: "Ride or driver not found" });

      const driverProfile = await Profile.findOne({ userId });
      if (ride.driverId.toString() !== userId) {
        return res.status(403).json({ error: "Unauthorized to update location" });
      }

      ride.driverLocation = { lat, lng };
      await ride.save();

      io.to(ride._id.toString()).emit("driverLocationUpdate", {
        rideId,
        location: { lat, lng },
        passengerId: ride.client.toString(),
      });

      res.status(200).json({ message: "Location updated" });
    } catch (error) {
      console.error("Error updating driver location:", error.message);
      res.status(500).json({ error: "Failed to update location" });
    }
  });


  //update driver location
  // Update driver location
erideRouter.post("/update-driver-location", verifyToken, async (req, res) => {
  const { lat, lng } = req.body;
  try {
    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user || user.role !== "driver") {
      return res.status(403).json({ error: "Invalid driver" });
    }
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    profile.location.coordinates = [lng, lat];
    await profile.save();
    res.status(200).json({ message: "Location updated" });
  } catch (error) {
    console.error("Error updating driver location:", error.message);
    res.status(500).json({ error: "Failed to update location" });
  }
});

// Driver ride history (modify existing /history endpoint to support drivers)
erideRouter.get("/driverhistory", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    let rides;
    if (user.role === "driver") {
      rides = await Ride.find({ driver: profile._id })
        .populate("clientId", "firstName lastName email")
        .populate("client", "phoneNumber profilePicture")
        .sort({ createdAt: -1 });
    } else {
      rides = await Ride.find({ client: profile._id })
        .populate("clientId", "firstName lastName email")
        .populate("client", "phoneNumber profilePicture")
        .sort({ createdAt: -1 });
    }
    res.status(200).json({ rides });
  } catch (error) {
    console.error("Error fetching ride history:", error.message);
    res.status(500).json({ error: "Failed to fetch ride history" });
  }
});




  // Chat between driver and client
  erideRouter.post("/:rideId/chat", verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || (ride.status !== "accepted" && ride.status !== "in_progress")) {
        return res.status(400).json({ error: "Chat not available" });
      }

      const profile = await Profile.findOne({ userId });
      if (
        ride.client.toString() !== profile._id.toString() &&
        ride.driverId?.toString() !== userId
      ) {
        return res.status(403).json({ error: "Unauthorized to send message" });
      }

      const message = {
        sender: profile._id,
        text,
        timestamp: new Date(),
      };
      ride.chatMessages.push(message);
      await ride.save();

      io.to(ride._id.toString()).emit("newMessage", {
        rideId,
        sender: {
          _id: profile._id,
          firstName: profile.firstName || profile.userId?.firstName,
          role: profile.role || profile.userId?.role,
        },
        text,
        timestamp: message.timestamp,
      });

      res.status(200).json({ message: "Message sent", message });
    } catch (error) {
      console.error("Error sending message:", error.message);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Initiate a call (placeholder for Twilio or similar)
  erideRouter.post("/:rideId/call", verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const userId = req.user.id;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || (ride.status !== "accepted" && ride.status !== "in_progress")) {
        return res.status(400).json({ error: "Call not available" });
      }

      const profile = await Profile.findOne({ userId });
      if (
        ride.client.toString() !== profile._id.toString() &&
        ride.driverId?.toString() !== userId
      ) {
        return res.status(403).json({ error: "Unauthorized to initiate call" });
      }

      const callData = {
        rideId,
        initiator: profile._id,
        initiatorRole: profile.role,
        timestamp: new Date(),
      };

      io.to(ride._id.toString()).emit("callInitiated", callData);
      res.status(200).json({ message: "Call initiated", callData });
    } catch (error) {
      console.error("Error initiating call:", error.message);
      res.status(500).json({ error: "Failed to initiate call" });
    }
  });

  // Client rates driver
  erideRouter.post("/:rideId/rate", verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const { rating, review } = req.body;
    const passengerId = req.user.id;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || ride.client.toString() !== (await Profile.findOne({ userId: passengerId }))._id.toString() || ride.status !== "completed") {
        return res.status(400).json({ error: "Invalid ride or passenger" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      ride.rating = rating;
      ride.review = review;
      await ride.save();

      const driverProfile = await Profile.findById(ride.driver);
      const currentRating = driverProfile.rating || 0;
      const currentRideCount = driverProfile.rideCount || 0;
      driverProfile.rating = (currentRating * currentRideCount + rating) / (currentRideCount + 1);
      driverProfile.rideCount = currentRideCount + 1;
      await driverProfile.save();

      io.to(ride.driver.toString()).emit("driverRated", {
        rideId,
        rating,
        review,
        newDriverRating: driverProfile.rating,
      });

      res.status(200).json({ message: "Driver rated", rating, review });
    } catch (error) {
      console.error("Error rating driver:", error.message);
      res.status(500).json({ error: "Failed to rate driver" });
    }
  });

 // Get interested drivers for a ride
 erideRouter.get("/:rideId/interested-drivers", verifyToken, async (req, res) => {
  const { rideId } = req.params;
  const userId = req.user?.id || req.user?._id; ;

  try {
    const ride = await Ride.findById(rideId).populate("driverOffers.driver");
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    const passengerProfile = await Profile.findOne({ userId });
    if (!passengerProfile || ride.client.toString() !== passengerProfile._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const driverDetails = await Promise.all(
      ride.driverOffers.map(async (offer) => {
        const driverUser = await User.findById(offer.driver.userId);
        return {
          _id: offer.driver._id,
          firstName: driverUser.firstName,
          lastName: driverUser.lastName,
          email: driverUser.email,
          phoneNumber: offer.driver.phoneNumber,
          profilePicture: offer.driver.profilePicture,
          carDetails: offer.driver.carDetails,
          rating: offer.driver.rating || 4.5,
          rideCount: offer.driver.rideCount || 0,
          offeredPrice: offer.offeredPrice,
          offerStatus: offer.status,
          timestamp: offer.timestamp,
        };
      })
    );

    res.status(200).json({ message: "Interested drivers fetched", drivers: driverDetails });
  } catch (error) {
    console.error("Error fetching interested drivers:", error.message);
    res.status(500).json({ error: "Failed to fetch interested drivers" });
  }
});

  // Get ride history for user (client or driver)
  erideRouter.get("/history", verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
      const profile = await Profile.findOne({ userId });
      if (!profile) return res.status(404).json({ error: "Profile not found" });

      const rides = await Ride.find({
        $or: [{ client: profile._id }, { driver: profile._id }],
      })
        .populate("client", "firstName lastName phoneNumber profilePicture")
        .populate("clientId", "firstName lastName email")
        .populate("driver", "firstName lastName phoneNumber profilePicture carDetails rating rideCount")
        .populate("driverId", "firstName lastName email")
        .sort({ createdAt: -1 });

      const formattedRides = rides.map((ride) => ({
        _id: ride._id,
        pickupAddress: ride.pickupAddress,
        destinationAddress: ride.destinationAddress,
        pickupCoordinates: ride.pickupCoordinates,
        destinationCoordinates: ride.destinationCoordinates,
        distance: ride.distance,
        passengerNum: ride.passengerNum,
        calculatedPrice: ride.calculatedPrice,
        desiredPrice: ride.desiredPrice,
        finalPrice: ride.finalPrice,
        rideOption: ride.rideOption,
        paymentMethod: ride.paymentMethod,
        status: ride.status,
        eta: ride.eta,
        rideStartTime: ride.rideStartTime,
        rideEndTime: ride.rideEndTime,
        rideDuration: ride.rideDuration,
        rating: ride.rating,
        review: ride.review,
        createdAt: ride.createdAt,
        client: ride.client
          ? {
              _id: ride.client._id,
              firstName: ride.clientId.firstName,
              lastName: ride.clientId.lastName,
              email: ride.clientId.email,
              phoneNumber: ride.client.phoneNumber,
              profilePicture: ride.client.profilePicture,
            }
          : null,
        driver: ride.driver
          ? {
              _id: ride.driver._id,
              firstName: ride.driverId.firstName,
              lastName: ride.driverId.lastName,
              email: ride.driverId.email,
              phoneNumber: ride.driver.phoneNumber,
              profilePicture: ride.driver.profilePicture,
              carDetails: ride.driver.carDetails,
              rating: ride.driver.rating,
              rideCount: ride.driver.rideCount,
            }
          : null,
      }));

      res.status(200).json({ message: "Ride history fetched", rides: formattedRides });
    } catch (error) {
      console.error("Error fetching ride history:", error.message);
      res.status(500).json({ error: "Failed to fetch ride history" });
    }
  });

 
  // Get driver statistics (completed rides, rejected rides, earnings, platform fee, income)
  erideRouter.get('/driver/:driverId/stats', verifyToken, async (req, res) => {
    const { driverId } = req.params;
    const userId = req.user?.id || req.user?._id;
    try {
      // Verify the requesting user is the driver
      const userProfile = await User.findOne({ _id: userId });
      if (!userProfile || userProfile.role !== 'driver') {
        return res.status(403).json({ error: 'Invalid driver' });
      }
  
      const profile = await Profile.findOne({ userId: userProfile._id });
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
  
      if (profile._id.toString() !== driverId) {
        return res.status(403).json({ error: 'Unauthorized: Invalid driver ID' });
      }
  
      // Query rides where driver was assigned or made an offer
      const rides = await Ride.find({
        $or: [
          { driverId: profile._id },
          { 'driverOffers.driver': profile._id },
        ],
      }).select('status driverId driverOffers interestedDrivers');
  
      // Calculate statistics
      const totalRides = rides.filter((ride) => ride.driverId && ride.driverId.toString() === profile._id.toString()).length;
  
      const completedRides = rides.filter(
        (ride) => ride.driverId && ride.driverId.toString() === profile._id.toString() && ride.status === 'completed'
      ).length;
  
      const cancelledRides = rides.filter(
        (ride) => ride.driverId && ride.driverId.toString() === profile._id.toString() && ride.status === 'cancelled'
      ).length;
  
      let acceptedRides = 0;
      let negotiatedRides = 0;
      let rejectedRides = 0;
      let totalEarnings = 0;
  
      rides.forEach((ride) => {
        const driverOffer = ride.driverOffers.find(
          (offer) => offer.driver.toString() === profile._id.toString()
        );
        const interestedDriver = ride.interestedDrivers.find(
          (entry) => entry.driverId.toString() === profile._id.toString()
        );
  
        if (driverOffer) {
          if (driverOffer.status === 'accepted' && interestedDriver) {
            if (interestedDriver.action === 'accepted') {
              acceptedRides++;
            } else if (interestedDriver.action === 'negotiated') {
              negotiatedRides++;
            }
            // Earnings from completed rides with accepted offers
            if (ride.status === 'completed' && ride.driverId.toString() === profile._id.toString()) {
              totalEarnings += driverOffer.offeredPrice || 0;
            }
          } else if (driverOffer.status === 'rejected') {
            rejectedRides++;
          }
        }
      });
  
      const platformFee = totalEarnings * 0.2; // 20% platform fee
      const income = totalEarnings - platformFee; // Driver's net income
  
      const stats = {
        totalRides,
        completedRides,
        acceptedRides,
        negotiatedRides,
        rejectedRides,
        cancelledRides,
        totalEarnings,
        platformFee,
        income,
      };
  
      res.status(200).json({ message: 'Driver statistics fetched', stats });
    } catch (error) {
      console.error('Error fetching driver statistics:', error.message);
      res.status(500).json({ error: 'Failed to fetch driver statistics' });
    }
  });
  

 


  erideRouter.get("/client/:clientId/stats", verifyToken, async (req, res) => {
    const { clientId } = req.params;
    const userId = req.user?.id || req.user?._id;
  
    try {
      // Find the User to check role
      const userProfile = await User.findOne({ _id: userId });
      if (!userProfile || userProfile.role !== "client") {
        return res.status(403).json({ error: "Invalid client" });
      }
  
      // Find the Profile to get Profile._id
      const profile = await Profile.findOne({ userId: userProfile._id });
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
  
      // Verify the clientId matches Profile._id
      if (profile._id.toString() !== clientId) {
        return res.status(403).json({ error: "Unauthorized: Invalid client ID" });
      }
  
      // Query rides for the client
      const rides = await Ride.find({ client: profile._id }).select("status finalPrice");
  
      // Calculate statistics
      const totalBookings = rides.length;
      const completedRides = rides.filter((ride) => ride.status === "completed").length;
      const rejectedRides = rides.filter((ride) => ride.status === "rejected").length;
      const pendingBookings = rides.filter((ride) => ride.status === "pending").length;
      const totalAmountSpent = rides
        .filter((ride) => ride.status === "completed")
        .reduce((sum, ride) => sum + (ride.finalPrice || 0), 0);
      const cancelledBookings = rides.filter((ride) => ride.status === "cancelled").length;
  
      const stats = {
        totalBookings,
        completedRides,
        rejectedRides,
        pendingBookings,
        totalAmountSpent,
        cancelledBookings,
      };
  
      res.status(200).json({ message: "Client statistics fetched", stats });
    } catch (error) {
      console.error("Error fetching client statistics:", error.message);
      res.status(500).json({ error: "Failed to fetch client statistics" });
    }
  });


  
erideRouter.get('/ride-statistics', verifyToken,  async (req, res) => {
  try {
    // Aggregation for clients
    const clientStats = await Ride.aggregate([
      {
        $match: {
          status: { $in: ['pending', 'completed', 'cancelled'] },
          clientId: { $ne: null },
        },
      },
      {
        $group: {
          _id: { status: '$status' },
          count: { $sum: 1 },
          totalAmount: {
            $sum: { $cond: [{ $eq: ['$finalPrice', null] }, 0, '$finalPrice'] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id.status',
          count: 1,
          totalAmount: 1,
        },
      },
      {
        $group: {
          _id: null,
          stats: { $push: { status: '$status', count: '$count', totalAmount: '$totalAmount' } },
        },
      },
      {
        $project: {
          _id: 0,
          pending: {
            $arrayElemAt: [
              { $filter: { input: '$stats', cond: { $eq: ['$$this.status', 'pending'] } } },
              0,
            ],
          },
          completed: {
            $arrayElemAt: [
              { $filter: { input: '$stats', cond: { $eq: ['$$this.status', 'completed'] } } },
              0,
            ],
          },
          cancelled: {
            $arrayElemAt: [
              { $filter: { input: '$stats', cond: { $eq: ['$$this.status', 'cancelled'] } } },
              0,
            ],
          },
        },
      },
      {
        $project: {
          pending: {
            count: { $ifNull: ['$pending.count', 0] },
            totalAmount: { $ifNull: ['$pending.totalAmount', 0] },
          },
          completed: {
            count: { $ifNull: ['$completed.count', 0] },
            totalAmount: { $ifNull: ['$completed.totalAmount', 0] },
          },
          cancelled: {
            count: { $ifNull: ['$cancelled.count', 0] },
            totalAmount: { $ifNull: ['$cancelled.totalAmount', 0] },
          },
        },
      },
    ]);

    // Aggregation for drivers
    const driverStats = await Ride.aggregate([
      {
        $match: {
          status: { $in: ['pending', 'completed', 'cancelled'] },
          driverId: { $ne: null },
        },
      },
      {
        $group: {
          _id: { status: '$status' },
          count: { $sum: 1 },
          totalAmount: {
            $sum: { $cond: [{ $eq: ['$finalPrice', null] }, 0, '$finalPrice'] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id.status',
          count: 1,
          totalAmount: 1,
        },
      },
      {
        $group: {
          _id: null,
          stats: { $push: { status: '$status', count: '$count', totalAmount: '$totalAmount' } },
        },
      },
      {
        $project: {
          _id: 0,
          pending: {
            $arrayElemAt: [
              { $filter: { input: '$stats', cond: { $eq: ['$$this.status', 'pending'] } } },
              0,
            ],
          },
          completed: {
            $arrayElemAt: [
              { $filter: { input: '$stats', cond: { $eq: ['$$this.status', 'completed'] } } },
              0,
            ],
          },
          cancelled: {
            $arrayElemAt: [
              { $filter: { input: '$stats', cond: { $eq: ['$$this.status', 'cancelled'] } } },
              0,
            ],
          },
        },
      },
      {
        $project: {
          pending: {
            count: { $ifNull: ['$pending.count', 0] },
            totalAmount: { $ifNull: ['$pending.totalAmount', 0] },
          },
          completed: {
            count: { $ifNull: ['$completed.count', 0] },
            totalAmount: { $ifNull: ['$completed.totalAmount', 0] },
          },
          cancelled: {
            count: { $ifNull: ['$cancelled.count', 0] },
            totalAmount: { $ifNull: ['$cancelled.totalAmount', 0] },
          },
        },
      },
    ]);

    // Combine results
    const result = {
      clients: clientStats[0] || {
        pending: { count: 0, totalAmount: 0 },
        completed: { count: 0, totalAmount: 0 },
        cancelled: { count: 0, totalAmount: 0 },
      },
      drivers: driverStats[0] || {
        pending: { count: 0, totalAmount: 0 },
        completed: { count: 0, totalAmount: 0 },
        cancelled: { count: 0, totalAmount: 0 },
      },
    };

    console.log('Ride statistics retrieved:', result);

    res.status(200).json({
      status: true,
      message: 'Ride statistics retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error retrieving ride statistics:', error.stack);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message,
    });
  }
});

  return erideRouter;
};