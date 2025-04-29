
import express from "express";
import Ride from "../../model/ride/rideSchema.js";
import Profile from "../../model/auth/profileSchema.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import User from "../../model/auth/authSchema.js";

import axios from "axios";
import dotenv from "dotenv"

dotenv.config()
const erideRouter = express.Router();

export default (io) => {
  const erideRouter = express.Router();

  async function geocodeAddress(address) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'e_RideProject/1.0' } }
      );
      const data = response.data[0];
      return { lat: parseFloat(data.lat), lng: parseFloat(data.lon) };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { lat: 0, lng: 0 }; 
    }
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }

  function calculateETA(distance, averageSpeedKmPerHour = 40) {
    // Distance in km, speed in km/h, time in hours
    const timeHours = distance / averageSpeedKmPerHour;
    const timeMinutes = Math.round(timeHours * 60); // Convert to minutes
    return timeMinutes;
  }

  erideRouter.post('/create', verifyToken, async (req, res) => {
    const passengerId = req.user.id;
    const {
      pickupAddress,
      destinationAddress,
      passengerNum,
      distance,
      calculatedPrice,
      desiredPrice,
      rideOption,
      paymentMethod,
    } = req.body;

    try {
      if (!pickupAddress || !destinationAddress || !passengerNum || !distance || !calculatedPrice || !rideOption || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const user = await User.findById(passengerId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: 'User details not found',
        });
      }

      const passenger = await Profile.findOne({ userId: passengerId });
      if (!passenger || passenger.role !== 'passenger') {
        return res.status(400).json({ error: 'Invalid passenger' });
      }

      const pickupCoordinates = await geocodeAddress(pickupAddress);
      const destinationCoordinates = await geocodeAddress(destinationAddress);
      if (!pickupCoordinates || !destinationCoordinates) {
        return res.status(400).json({ error: 'Failed to geocode addresses' });
      }

      const computedDistance = calculateDistance(pickupCoordinates.lat, pickupCoordinates.lng, destinationCoordinates.lat, destinationCoordinates.lng);
      const computedPrice = Math.round(computedDistance * 200);

      const ride = new Ride({
        userId: user._id,
        passenger: passenger._id,
        pickupAddress,
        destinationAddress,
        distance: computedDistance,
        passengerNum,
        calculatedPrice: computedPrice,
        desiredPrice: desiredPrice || computedPrice,
        rideOption,
        paymentMethod,
        pickupCoordinates,
        destinationCoordinates,
      });
      await ride.save();

      const rideData = {
        _id: ride._id,
        userId: { firstName: user.firstName, lastName: user.lastName },
        passenger: {
          userEmail: user.email,
          phoneNumber: passenger.phoneNumber,
          profilePicture: passenger.profilePicture,
        },
        pickupAddress,
        destinationAddress,
        distance: computedDistance,
        passengerNum,
        calculatedPrice: computedPrice,
        desiredPrice: ride.desiredPrice,
        rideOption,
        paymentMethod,
        pickupCoordinates,
        destinationCoordinates,
      };

      io.emit('newRideAvailable', rideData);

      const nearbyDrivers = await Profile.find({ role: 'driver' });
      nearbyDrivers.forEach((driver) =>
        io.to(driver._id.toString()).emit('newRideRequest', rideData)
      );

      res.status(201).json(ride);
    } catch (error) {
      console.error('Error creating ride:', error);
      res.status(500).json({ error: 'Failed to create ride' });
    }
  });

  erideRouter.get("/available", verifyToken, async (req, res) => {
    try {
      const rides = await Ride.find({ status: 'pending', driver: null })
        .populate("passenger", "profilePicture userEmail phoneNumber")
        .populate("userId", "firstName lastName email")
        .select('-__v');
      
      if (!rides.length) {
        return res.status(200).json([]);
      }
      
      console.log("Available rides:", rides);
      res.status(200).json(rides);
    } catch (error) {
      console.error('Error fetching available rides:', error);
      res.status(500).json({ error: 'Server error while fetching rides' });
    }
  });

  erideRouter.get("/nearby", verifyToken, async (req, res) => {
    const driverId = req.user.id;
    try {
      const driver = await Profile.findById(driverId);
      if (!driver || driver.role !== "driver") {
        return res.status(400).json({ error: "Invalid driver" });
      }

      const rides = await Ride.find({ status: "pending", driver: null }).populate(
        "passenger",
        "firstName lastName rating rideCount"
      );

      const nearbyRides = rides.filter((ride) => {
        const distance = calculateDistance(
          driver.location.lat,
          driver.location.lng,
          ride.pickupLatLng.lat,
          ride.pickupLatLng.lng
        );
        return distance <= 10; 
      });

      res.status(200).json(nearbyRides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch nearby rides" });
    }
  });

  erideRouter.post("/:rideId/offer", verifyToken, async (req, res) => {
    const driverId = req.user.id;
    const { rideId } = req.params;
    const { offeredPrice } = req.body; 

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || ride.status !== "pending") {
        return res.status(400).json({ error: "Ride not available" });
      }

      const driver = await Profile.findById(driverId);
      if (!driver || driver.role !== "driver") {
        return res.status(400).json({ error: "Invalid driver" });
      }

      ride.driverOffers.push({
        driver: driverId,
        offeredPrice,
        status: "pending",
      });
      await ride.save();

      io.to(ride.passenger.toString()).emit("driverOffer", {
        rideId,
        driver: { id: driverId, firstName: driver.firstName, lastName: driver.lastName, rating: driver.rating, rideCount: driver.rideCount },
        offeredPrice,
      });

      res.status(200).json({ message: "Offer submitted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit offer" });
    }
  });

  erideRouter.post('/:deliveryId/confirm-driver', verifyToken, async (req, res) => {
    const userId = req.user.id; 
    const { deliveryId } = req.params;
    const { driverId } = req.body;

    try {
      const ride = await Ride.findById(deliveryId).populate('driverOffers.driver');
      if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: 'User not found',
        });
      }

      const passengerProfile = await Profile.findOne({ userId: user._id });
      if (!passengerProfile) {
        return res.status(404).json({
          status: false,
          message: 'Profile not found for this user',
        });
      }

      if (ride.passenger.toString() !== passengerProfile._id.toString()) {
        return res.status(403).json({ error: 'You are not authorized to confirm this ride' });
      }

      if (ride.status !== 'pending') {
        return res.status(400).json({ error: 'Ride is not in a pending state' });
      }

      if (!ride.driverOffers || ride.driverOffers.length === 0) {
        return res.status(400).json({ error: 'No driver offers available' });
      }

      const offer = ride.driverOffers.find((o) => o.driver._id.toString() === driverId);
      if (!offer) {
        return res.status(404).json({ error: 'Driver offer not found' });
      }

      if (ride.driver) {
        return res.status(400).json({ error: 'Driver already assigned' });
      }

      ride.driver = driverId;
      ride.status = 'accepted';
      ride.finalPrice = offer.offeredPrice;
      offer.status = 'accepted';
      ride.driverOffers
        .filter((o) => o.driver.toString() !== driverId)
        .forEach((o) => (o.status = 'rejected'));

      await ride.save();

      const distance = calculateDistance(
        ride.pickupCoordinates.lat,
        ride.pickupCoordinates.lng,
        ride.destinationCoordinates.lat,
        ride.destinationCoordinates.lng
      );
      const etaMinutes = calculateETA(distance);

      const passengerData = {
        _id: passengerProfile._id,
        firstName: passengerProfile.firstName || 'Passenger Name', 
        phoneNumber: passengerProfile.phoneNumber || 'N/A', 
        pickupCoordinates: ride.pickupCoordinates,
        destinationCoordinates: ride.destinationCoordinates, 
        rideId: ride._id,
        status: ride.status,
        etaMinutes,
        distance,
      };

      const driverData = {
        _id: driverId,
        firstName: offer.driver.firstName || 'Driver Name',
        carDetails: offer.driver.carDetails || {
          model: 'Toyota',
          year: 2020,
          plateNumber: 'ABC123',
        },
        distance,
        etaMinutes,
        driverProposedPrice: offer.offeredPrice,
        rating: offer.driver.rating || '4.5',
        pickupCoordinates: ride.pickupCoordinates,
        destinationCoordinates: ride.destinationCoordinates,
      };

      io.to(ride._id.toString()).emit('rideConfirmed', { driver: driverData });
      io.to(driverId).emit('rideAccepted', { passenger: passengerData });
      console.log('Emitted rideConfirmed and rideAccepted:', driverData, { passenger: passengerData });

      res.status(200).json({
        message: 'Driver accepted successfully',
        finalPrice: ride.finalPrice,
      });
    } catch (error) {
      console.error('Error accepting driver:', error);
      res.status(500).json({ error: 'Failed to accept driver' });
    }
  });

  erideRouter.get('/passenger/booked', verifyToken, async (req, res) => {
    try {
      const profile = await Profile.findOne({ userId: req.user.id });
      if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
  
      const rides = await Ride.find({ passenger: profile._id })
        .populate('driver', 'carPicture carDetails profilePicture phoneNumber userEmail')
        .populate('driverId', 'firstName lastName email ')
        .sort({ createdAt: -1 });
      console.log(rides);
      res.json({ success: true, rides });
    } catch (error) {
      console.error('Error fetching booked rides:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  erideRouter.get('/driver/:driverId', verifyToken, async (req, res) => {
    const { driverId } = req.params;
  
    try {
      if (req.user.id !== driverId) {
        return res.status(403).json({
          status: false,
          message: 'Unauthorized: You can only access your own ride history',
        });
      }
 
      const rides = await Ride.find({ driver: driverId })
        .populate('passenger', 'firstName lastName userEmail phoneNumber profilePicture')
        .populate('userId', 'firstName lastName')
        .sort({ createdAt: -1 });
  
      if (!rides || rides.length === 0) {
        return res.status(200).json([]);
      }
  
      const formattedRides = rides.map((ride) => ({
        _id: ride._id,
        pickupAddress: ride.pickupAddress,
        destinationAddress: ride.destinationAddress,
        distance: ride.distance || 'N/A',
        calculatedPrice: ride.calculatedPrice || ride.finalPrice || 0,
        passengerNum: ride.passengerNum || 1,
        rideOption: ride.rideOption || 'N/A',
        paymentMethod: ride.paymentMethod || 'N/A',
        status: ride.status,
        createdAt: ride.createdAt,
        passenger: ride.passenger
          ? {
              _id: ride.passenger._id,
              firstName: ride.passenger.firstName,
              lastName: ride.passenger.lastName,
              userEmail: ride.passenger.userEmail,
              phoneNumber: ride.passenger.phoneNumber,
              profilePicture: ride.passenger.profilePicture || 'https://via.placeholder.com/150',
            }
          : null,
        userId: ride.userId
          ? {
              _id: ride.userId._id,
              firstName: ride.userId.firstName,
              lastName: ride.userId.lastName,
            }
          : null,
      }));
  
      res.status(200).json(formattedRides);
    } catch (error) {
      console.error('Error fetching ride history:', error);
      res.status(500).json({
        status: false,
        message: 'Failed to fetch ride history',
      });
    }
  });

  erideRouter.post('/:deliveryId/reject-driver', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { deliveryId } = req.params;
    const { driverId } = req.body;

    try {
      const ride = await Ride.findById(deliveryId).populate('driverOffers.driver');
      if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const passengerProfile = await Profile.findOne({ userId: user._id });
      if (!passengerProfile || ride.passenger.toString() !== passengerProfile._id.toString()) {
        return res.status(403).json({ error: 'You are not authorized to reject this driver' });
      }

      if (ride.status !== 'pending') {
        return res.status(400).json({ error: 'Ride is not in a pending state' });
      }

      const offer = ride.driverOffers.find((o) => o.driver._id.toString() === driverId);
      if (!offer) {
        return res.status(404).json({ error: 'Driver offer not found' });
      }

      offer.status = 'rejected';
      ride.interestedDrivers = ride.interestedDrivers.filter((id) => id.toString() !== driverId);
      await ride.save();

      io.to(driverId).emit('driverRejected', { rideId: deliveryId });
      io.to(ride._id.toString()).emit('driverOfferRejected', { driverId });
      console.log('Emitted driverRejected and driverOfferRejected:', { driverId });

      res.status(200).json({ message: 'Driver offer rejected successfully' });
    } catch (error) {
      console.error('Error rejecting driver:', error);
      res.status(500).json({ error: 'Failed to reject driver' });
    }
  });

  erideRouter.put('/:rideId/accept', verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const userId = req.user.id;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
      }

      if (ride.status !== 'pending' || ride.driver) {
        return res.status(400).json({ error: 'Ride is no longer available for acceptance' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: 'User not found',
        });
      }

      const profile = await Profile.findOne({ userId: user._id });
      if (!profile) {
        return res.status(404).json({
          status: false,
          message: 'Profile not found for this user',
        });
      }

      const driverId = profile._id;
      const driverOffer = {
        driver: driverId,
        offeredPrice: req.body.proposedPrice || ride.calculatedPrice,
        status: 'pending',
        timestamp: new Date(),
      };

      ride.interestedDrivers = ride.interestedDrivers || [];
      if (!ride.interestedDrivers.includes(driverId)) {
        ride.interestedDrivers.push(driverId);
      }
      ride.driverOffers = ride.driverOffers || [];
      ride.driverOffers.push(driverOffer);
      await ride.save();

      const driverData = {
        _id: driverId,
        firstName: user.firstName || 'Driver Name', 
        lastName: user.lastName || 'Driver Name', 
        email: user.email || "email",
        phoneNumber: profile.phoneNumber || "phone",
        profilePicture: profile.profilePicture,
        carDetails: profile.carDetails || {
          model: 'Toyota',
          year: 2020,
          plateNumber: 'ABC123',
        },
        carPicture: profile.carPicture,
        distance: '2km',
        driverProposedPrice: driverOffer.offeredPrice,
        rating: profile.rating || '4.5',
      };

      io.to(ride._id.toString()).emit('driverNegotiated', driverData);
      console.log('Emitted driverNegotiated:', driverData);
      res.json({ message: 'Driver proposed a price', ride });
    } catch (error) {
      console.error('Error accepting ride:', error);
      res.status(500).json({ error: 'Server error while accepting ride' });
    }
  });

  erideRouter.put('/:rideId/reject', verifyToken, async (req, res) => {
    const { rideId } = req.params;
  
    try {
      const ride = await Ride.findById(rideId);
      if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
      }
  
      if (ride.status !== 'pending' || ride.driver) {
        return res.status(400).json({ error: 'Ride is no longer available for rejection' });
      }
  
      ride.status = 'rejected';
      await ride.save();
  
      res.status(200).json({ message: 'Ride rejected successfully', ride });
    } catch (error) {
      console.log(error);
      console.error('Error rejecting ride:', error);
      res.status(500).json({ error: 'Server error while rejecting ride' });
    }
  });

  erideRouter.get('/driver/accepted/:driverId', verifyToken, async (req, res) => {
    const { driverId } = req.params;
    const userId = req.user.id; 

    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        return res.status(404).json({
          status: false,
          message: 'User profile not found',
        });
      }

      if (userProfile._id.toString() !== driverId) {
        return res.status(403).json({
          status: false,
          message: 'Unauthorized: You can only view your own accepted rides',
        });
      }

      const acceptedRides = await Ride.find({
        driver: userProfile._id,
        status: 'accepted',
      })
        .populate('passenger', 'firstName lastName userEmail phoneNumber profilePicture')
        .populate('userId', 'firstName lastName')
        .sort({ createdAt: -1 });

      if (!acceptedRides || acceptedRides.length === 0) {
        return res.status(200).json([]);
      }

      const formattedRides = acceptedRides.map((ride) => ({
        _id: ride._id,
        pickupAddress: ride.pickupAddress,
        destinationAddress: ride.destinationAddress,
        pickupCoordinates: ride.pickupCoordinates,
        destinationCoordinates: ride.destinationCoordinates,
        distance: ride.distance || 'N/A',
        calculatedPrice: ride.calculatedPrice || ride.finalPrice || 0,
        passengerNum: ride.passengerNum || 1,
        rideOption: ride.rideOption || 'N/A',
        paymentMethod: ride.paymentMethod || 'N/A',
        status: ride.status,
        createdAt: ride.createdAt,
        passenger: ride.passenger
          ? {
              _id: ride.passenger._id,
              firstName: ride.passenger.firstName,
              lastName: ride.passenger.lastName,
              userEmail: ride.passenger.userEmail,
              phoneNumber: ride.passenger.phoneNumber,
              profilePicture: ride.passenger.profilePicture || 'https://via.placeholder.com/150',
            }
          : null,
        userId: ride.userId
          ? {
              _id: ride.userId._id,
              firstName: ride.userId.firstName,
              lastName: ride.userId.lastName,
            }
          : null,
      }));

      res.status(200).json(formattedRides);
    } catch (error) {
      console.error('Error fetching accepted rides:', error);
      res.status(500).json({
        status: false,
        message: 'Failed to fetch accepted rides',
      });
    }
  });

  erideRouter.put("/:rideId/complete", verifyToken, async (req, res) => {
    const driverId = req.user.id;
    const { rideId } = req.params;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || ride.driver.toString() !== driverId || ride.status !== "in_progress") {
        return res.status(400).json({ error: "Invalid ride or driver" });
      }

      ride.status = "completed";
      ride.rideEndTime = new Date();
      ride.rideDuration = Math.round((ride.rideEndTime - ride.rideStartTime) / 60000);
      await ride.save();

      io.to(rideId).emit("rideCompleted", { rideId, rideDuration: ride.rideDuration });
      res.status(200).json({ message: "Ride completed", rideDuration: ride.rideDuration });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete ride" });
    }
  });

  erideRouter.put("/:rideId/start", verifyToken, async (req, res) => {
    const driverId = req.user.id;
    const { rideId } = req.params;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || ride.driver.toString() !== driverId || ride.status !== "accepted") {
        return res.status(400).json({ error: "Invalid ride or driver" });
      }

      ride.status = "in_progress";
      ride.rideStartTime = new Date();
      await ride.save();

      io.to(rideId).emit("rideStarted", { rideId, passengerId: ride.passenger.toString(), driverId });
      res.status(200).json({ message: "Ride started" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start ride" });
    }
  });

  erideRouter.post('/:rideId/update-location', verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const { lat, lng } = req.body;
    const userId = req.user.id;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || !ride.driver) return res.status(404).json({ error: 'Ride or driver not found' });
      const driverProfile = await Profile.findOne({ userId });
      if (ride.driver.toString() !== driverProfile._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized to update location' });
      }

      ride.driverLocation = { lat, lng };
      await ride.save();

      io.to(ride._id.toString()).emit('driverLocationUpdate', { location: { lat, lng } });
      res.status(200).json({ message: 'Location updated' });
    } catch (error) {
      console.error('Error updating driver location:', error);
      res.status(500).json({ error: 'Failed to update location' });
    }
  });

  erideRouter.put("/:rideId/negotiate", verifyToken, async(req, res) => {
    try {
      const { driverPrice } = req.body;
      const ride = await Ride.findById(req.params.rideId);
      if (!ride) return res.status(404).json({ error: 'Ride not found' });
      if (ride.status !== 'pending') return res.status(400).json({ error: 'Ride is not available' });
      if (ride.negotiationStatus === 'pending') return res.status(400).json({ error: 'Negotiation already in progress' });
  
      ride.negotiationStatus = 'pending';
      ride.driverProposedPrice = driverPrice;
      ride.driver = req.user._id;
      ride.interestedDrivers = ride.interestedDrivers || [];
      if (!ride.interestedDrivers.includes(req.user._id)) {
        ride.interestedDrivers.push(req.user._id);
      }
      await ride.save();
  
      res.json({ message: 'Negotiation offer sent', ride });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  erideRouter.get("/my-ride-drivers", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await Profile.findOne({ userId });
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "You are not authorized",
        });
      }

      const profileId = user._id;
      const rides = await Ride.find({ passenger: profileId }) 
        .populate({
          path: 'driver',
          model: 'Profile', 
          populate: {
            path: 'userId',
            model: 'Auth',
            select: 'firstName lastName email phoneNumber',
          },
        })
        .select('-__v');

      if (!rides.length) {
        return res.status(200).json({ message: "No rides found for this passenger", data: [] });
      }

      const results = rides.map(ride => {
        const allInterestedDrivers = ride.interestedDrivers.map(driver => ({
          fullName: `${driver.userId.firstName} ${driver.userId.lastName}`,
          email: driver.userId.email,
          phoneNumber: driver.userId.phoneNumber,
          proposedPrice: ride.driverProposedPrice || null,
          status: ride.status === "accepted" && ride.driver?.id === driver.id ? "Accepted" : "Negotiated",
        }));

        return {
          rideId: ride._id,
          desiredPrice: ride.desiredPrice,
          negotiationStatus: ride.negotiationStatus,
          status: ride.status,
          acceptedDriver: ride.driver
            ? {
                fullName: `${ride.driver.userId.firstName} ${ride.driver.userId.lastName}`,
                email: ride.driver.userId.email,
                phoneNumber: ride.driver.userId.phoneNumber,
                status: "Accepted",
                proposedPrice: ride.driverProposedPrice || null,
              }
            : null,
          interestedDrivers: allInterestedDrivers,
        };
      });
      console.log("My results!!!!", results);
      res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching ride drivers:", error);
      res.status(500).json({ error: "Server error while fetching ride drivers" });
    }
  });

  erideRouter.post("/:rideId/rate", verifyToken, async (req, res) => {
    const passengerId = req.user.id;
    const { rideId } = req.params;
    const { rating, review } = req.body;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || ride.passenger.toString() !== passengerId || ride.status !== "completed") {
        return res.status(400).json({ error: "Invalid ride or passenger" });
      }

      ride.rating = rating;
      ride.review = review;
      await ride.save();

      const driver = await Profile.findById(ride.driver);
      driver.rating = ((driver.rating || 0) * (driver.rideCount || 0) + rating) / (driver.rideCount + 1);
      driver.rideCount = (driver.rideCount || 0) + 1;
      await driver.save();

      res.status(200).json({ message: "Driver rated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to rate driver" });
    }
  });

  erideRouter.post("/:rideId/chat", verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const { text } = req.body;
    const senderId = req.user.id;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || (ride.status !== "accepted" && ride.status !== "in_progress")) {
        return res.status(400).json({ error: "Chat not available" });
      }
      if (ride.passenger.toString() !== senderId && ride.driver.toString() !== senderId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const message = { sender: senderId, text, timestamp: new Date() };
      ride.chatMessages.push(message);
      await ride.save();

      io.to(rideId).emit("newMessage", message);
      res.status(200).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  erideRouter.get("/history", verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
      const rides = await Ride.find({
        $or: [{ passenger: userId }, { driver: userId }],
      })
        .populate("passenger", "firstName")
        .populate("driver", "firstName rating rideCount");

      res.status(200).json(rides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ride history" });
    }
  });

  erideRouter.get('/passengerRides', verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
    
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          status: false,
          message: 'Authentication failed. Invalid token or user not found.',
        });
      }
      
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        return res.status(404).json({
          status: false,
          message: 'Profile not found for this user',
        });
      }
      
      const rides = await Ride.findOne({ 'passenger': userProfile._id })
        .populate('driverOffers.driver', "firstName lastName email");
      
      console.log('Fetched rides:', rides);
      res.json(rides);
    } catch (error) {
      console.error('Error fetching ride history:', error);
      res.status(500).json({ error: 'Server error while fetching ride history' });
    }
  });

  erideRouter.get('/:rideId/interested-drivers', verifyToken, async (req, res) => {
    try {
      const ride = await Ride.findById(req.params.rideId).populate('driver');
      if (!ride) return res.status(404).json({ error: 'Ride not found' });
      if (!req.user || !ride.passenger?.userId || ride.passenger.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
  
      const interestedDrivers = await Profile.find({
        _id: { $in: ride.interestedDrivers || [ride.driver] },
        role: 'driver',
      });
  
      const driverDetails = interestedDrivers.map(driver => ({
        _id: driver._id,
        firstName: driver.firstName,
        carDetails: driver.carDetails,
        distance: 'Calculating...',
        driverProposedPrice: ride.negotiationStatus === 'pending' && ride.driver?.toString() === driver._id.toString() ? ride.driverProposedPrice : null,
      }));
  
      res.json(driverDetails);
    } catch (error) {
      console.error('Error fetching interested drivers:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  erideRouter.put('/:rideId/negotiate', verifyToken, async (req, res) => {
    const io = req.app.get('io');
    try {
      const { driverId, proposedPrice } = req.body;
      const ride = await Ride.findById(req.params.rideId);
      if (!ride) return res.status(404).json({ error: 'Ride not found' });
  
      const driver = await Profile.findOne({ _id: driverId, role: 'driver' });
      if (!driver) return res.status(404).json({ error: 'Driver not found' });
  
      if (!ride.interestedDrivers.includes(driverId)) {
        ride.interestedDrivers.push(driverId);
      }
      ride.driverProposedPrice = proposedPrice;
      ride.negotiationStatus = 'pending';
      await ride.save();
  
      io.to(req.params.rideId).emit('driverNegotiated', {
        _id: driver._id,
        firstName: driver.firstName,
        carDetails: driver.carDetails,
        distance: 'Calculating...',
        driverProposedPrice: proposedPrice,
      });
  
      res.json({ message: 'Price negotiated', ride });
    } catch (error) {
      console.error('Error negotiating price:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });



  erideRouter.get("/history", verifyToken, async(req, res) => {
    try {
       const userId = req.user.id;
       
       const rideAsClient =await Ride.find({clientId: userId })
            .populate('clientId', 'firstName lastName email  uniqueNumber') // Populate client details
            .populate('client', 'profilePicture phone') // Populate client profile picture
            .populate('driverId', 'firstName lastName email  uniqueNumber') // Populate errander details
            .populate('driver', 'profilePicture phone');
        
       const rideAsDriver = await Ride.find({driverId: userId})
            .populate('clientId', 'firstName lastName email  uniqueNumber') // Populate client details
            .populate('client', 'profilePicture phone') // Populate client profile picture
            .populate('driverId', 'firstName lastName email  uniqueNumber') // Populate errander details
            .populate('driver', 'profilePicture phone');


        const history =  [ ...rideAsClient, ...rideAsDriver]
        res.status(200).json({
            status: true, history
        })
 

    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
  })
  erideRouter.post('/:rideId/cancel', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { rideId } = req.params;
  
    try {
      const ride = await Ride.findById(rideId);
      if (!ride) return res.status(404).json({ error: 'Ride not found' });

      const passengerProfile = await Profile.findOne({ userId });
      const driverProfile = await Profile.findOne({ userId });

      const isPassenger = ride.passenger.toString() === passengerProfile?._id.toString();
      const isDriver = ride.driver.toString() === driverProfile?._id.toString();

      if (!isPassenger && !isDriver) {
        return res.status(403).json({ error: 'Unauthorized to cancel this ride' });
      }

      if (ride.status === 'completed' || ride.status === 'cancelled') {
        return res.status(400).json({ error: 'Ride cannot be cancelled' });
      }
  
      ride.status = 'cancelled';
      await ride.save();
  
      io.to(ride._id.toString()).emit('rideCancelled', { 
        rideId,
        cancelledBy: isPassenger ? 'passenger' : 'driver',
        passengerId: ride.passenger.toString(),
        driverId: ride.driver.toString()
      });
      res.status(200).json({ message: 'Ride cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling ride:', error);
      res.status(500).json({ error: 'Failed to cancel ride' });
    }
  });

  return erideRouter;
};