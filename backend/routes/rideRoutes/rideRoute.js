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

  // Create a new ride
  erideRouter.post("/create", verifyToken, async (req, res) => {
    const passengerId = req.user?.id || req.user?._id; 
    const { pickupAddress, destinationAddress, passengerNum, rideOption, paymentMethod, desiredPrice } = req.body;

    try {
      if (!pickupAddress || !destinationAddress || !passengerNum || !rideOption || !paymentMethod) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await User.findById(passengerId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const passenger = await Profile.findOne({ userId: passengerId });
      if (!passenger || passenger.role !== "client") {
        return res.status(403).json({ error: "Invalid passenger" });
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
      const nearbyDrivers = await Profile.find({ role: "driver" });
      nearbyDrivers.forEach((driver) => {
        io.to(driver._id.toString()).emit("newRideRequest", rideData);
      });

      res.status(201).json({ message: "Ride created", ride: rideData });
    } catch (error) {
      console.error("Error creating ride:", error.message);
      res.status(500).json({ error: "Failed to create ride" });
    }
  });

  // Get available rides for drivers
  erideRouter.get("/available", verifyToken, async (req, res) => {
    try {
      const driver = await Profile.findOne({ userId: req.user?.id });
      if (!driver || driver.role !== "driver") {
        return res.status(403).json({ error: "Invalid driver" });
      }

      const rides = await Ride.find({ status: "pending", driverId: null })
        .populate("client", "profilePicture phoneNumber")
        .populate("clientId", "firstName lastName email")
        .sort({ createdAt: -1 });

      const nearbyRides = rides
        .filter((ride) => {
          if (!driver.location || !ride.pickupCoordinates) return false;
          const distance = calculateDistance(
            driver.location.lat,
            driver.location.lng,
            ride.pickupCoordinates.lat,
            ride.pickupCoordinates.lng
          );
          return distance <= 10; // Within 10km
        })
        .map((ride) => ({
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
        }));

      res.status(200).json(nearbyRides);
    } catch (error) {
      console.error("Error fetching available rides:", error.message);
      res.status(500).json({ error: "Failed to fetch available rides" });
    }
  });

  // Driver submits an offer (accept or negotiate)
  erideRouter.post("/:rideId/offer", verifyToken, async (req, res) => {
    const driverId = req.user?.id || req.user?._id; ;
    const { rideId } = req.params;
    const { offeredPrice } = req.body;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride || ride.status !== "pending" || ride.driverId) {
        return res.status(400).json({ error: "Ride not available" });
      }

      const driverProfile = await Profile.findOne({ userId: driverId });
      if (!driverProfile || driverProfile.role !== "driver") {
        return res.status(403).json({ error: "Invalid driver" });
      }

      const driver = await User.findById(driverId);
      if (!driver) return res.status(404).json({ error: "Driver not found" });

      if (!ride.interestedDrivers.includes(driverProfile._id)) {
        ride.interestedDrivers.push(driverProfile._id);
      }

      const offer = {
        driver: driverProfile._id,
        offeredPrice: offeredPrice || ride.calculatedPrice,
        status: "pending",
        timestamp: new Date(),
      };
      ride.driverOffers.push(offer);
      await ride.save();

      const driverData = {
        rideId,
        driver: {
          _id: driverProfile._id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          phoneNumber: driverProfile.phoneNumber,
          profilePicture: driverProfile.profilePicture,
          carDetails: driverProfile.carDetails,
          rating: driverProfile.rating || 4.5,
          rideCount: driverProfile.rideCount || 0,
        },
        offeredPrice: offer.offeredPrice,
      };

      io.to(ride.client.toString()).emit("driverOffer", driverData);
      res.status(200).json({ message: "Offer submitted", offer });
    } catch (error) {
      console.error("Error submitting offer:", error.message);
      res.status(500).json({ error: "Failed to submit offer" });
    }
  });

  // Client confirms a driver
  erideRouter.post("/:rideId/confirm-driver", verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const { driverId } = req.body;
    const passengerId = req.user?.id || req.user?._id; ;

    try {
      const ride = await Ride.findById(rideId).populate("driverOffers.driver");
      if (!ride) return res.status(404).json({ error: "Ride not found" });

      const passengerProfile = await Profile.findOne({ userId: passengerId });
      if (!passengerProfile || ride.client.toString() !== passengerProfile._id.toString()) {
        return res.status(403).json({ error: "Unauthorized to confirm this ride" });
      }

      if (ride.status !== "pending") {
        return res.status(400).json({ error: "Ride is not pending" });
      }

      const offer = ride.driverOffers.find((o) => o.driver._id.toString() === driverId);
      if (!offer) return res.status(404).json({ error: "Driver offer not found" });

      const driverUser = await User.findById(driverId);
      if (!driverUser) return res.status(404).json({ error: "Driver not found" });

      ride.driverId = driverUser._id;
      ride.driver = offer.driver._id;
      ride.status = "accepted";
      ride.finalPrice = offer.offeredPrice;
      offer.status = "accepted";
      ride.driverOffers.forEach((o) => {
        if (o.driver.toString() !== driverId) o.status = "rejected";
      });

      const distance = calculateDistance(
        ride.pickupCoordinates.lat,
        ride.pickupCoordinates.lng,
        ride.destinationCoordinates.lat,
        ride.destinationCoordinates.lng
      );
      ride.eta = calculateETA(distance);
      await ride.save();

      const passengerData = {
        _id: passengerProfile._id,
        firstName: passengerProfile.firstName || passengerProfile.clientId?.firstName,
        lastName: passengerProfile.lastName || passengerProfile.clientId?.lastName,
        email: passengerProfile.clientId?.email,
        phoneNumber: passengerProfile.phoneNumber,
        profilePicture: passengerProfile.profilePicture,
        pickupCoordinates: ride.pickupCoordinates,
        destinationCoordinates: ride.destinationCoordinates,
        rideId: ride._id,
        status: ride.status,
        eta: ride.eta,
        distance,
      };

      const driverData = {
        _id: offer.driver._id,
        firstName: driverUser.firstName,
        lastName: driverUser.lastName,
        email: driverUser.email,
        phoneNumber: offer.driver.phoneNumber,
        profilePicture: offer.driver.profilePicture,
        carDetails: offer.driver.carDetails || { model: "Toyota", year: 2020, plateNumber: "ABC123" },
        rating: offer.driver.rating || 4.5,
        rideCount: offer.driver.rideCount || 0,
        distance,
        eta: ride.eta,
        finalPrice: ride.finalPrice,
      };

      io.to(ride._id.toString()).emit("rideConfirmed", { driver: driverData, passenger: passengerData });
      io.to(driverId).emit("rideAccepted", { passenger: passengerData });
      io.emit("rideStatusUpdate", { rideId, status: "accepted" });

      res.status(200).json({ message: "Driver confirmed", finalPrice: ride.finalPrice, ride });
    } catch (error) {
      console.error("Error confirming driver:", error.message);
      res.status(500).json({ error: "Failed to confirm driver" });
    }
  });

  // Client rejects a driver’s offer
  erideRouter.post("/:rideId/reject-driver", verifyToken, async (req, res) => {
    const { rideId } = req.params;
    const { driverId } = req.body;
    const passengerId = req.user?.id || req.user?._id; ;

    try {
      const ride = await Ride.findById(rideId).populate("driverOffers.driver");
      if (!ride) return res.status(404).json({ error: "Ride not found" });

      const passengerProfile = await Profile.findOne({ userId: passengerId });
      if (!passengerProfile || ride.client.toString() !== passengerProfile._id.toString()) {
        return res.status(403).json({ error: "Unauthorized to reject this driver" });
      }

      if (ride.status !== "pending") {
        return res.status(400).json({ error: "Ride is not pending" });
      }

      const offer = ride.driverOffers.find((o) => o.driver._id.toString() === driverId);
      if (!offer) return res.status(404).json({ error: "Driver offer not found" });

      offer.status = "rejected";
      ride.interestedDrivers = ride.interestedDrivers.filter((id) => id.toString() !== driverId);
      await ride.save();

      io.to(driverId).emit("driverRejected", { rideId });
      io.to(ride._id.toString()).emit("driverOfferRejected", { driverId });

      res.status(200).json({ message: "Driver offer rejected" });
    } catch (error) {
      console.error("Error rejecting driver:", error.message);
      res.status(500).json({ error: "Failed to reject driver" });
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
          role: profile.role,
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

  // Get driver statistics (completed rides, rejected rides, earnings, platform fee, income)
  erideRouter.get("/driver/:driverId/stats", verifyToken, async (req, res) => {
    const { driverId } = req.params;
    const userId =req.user?.id || req.user?._id; 
    try {
      // Verify the requesting user is the driver
      const userProfile = await User.findOne({ _id: userId });
      if (!userProfile || userProfile.role !== "driver") {
        return res.status(403).json({ error: "Invalid driver" });
      }

      const profile = await Profile.findOne({ userId: userProfile._id });
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      if (profile._id.toString() !== driverId) {
        return res.status(403).json({ error: "Unauthorized: Invalid client ID" });
      }
  
      // Query rides for the driver
      const rides = await Ride.find({ driverId: profile._id }).select("status desiredPrice");

      // Calculate statistics
      const completedRides = rides.filter((ride) => ride.status === "completed").length;
      const rejectedRides = rides.filter((ride) => ride.status === "rejected").length;
      const totalEarnings = rides
        .filter((ride) => ride.status === "completed")
        .reduce((sum, ride) => sum + (ride.desiredPrice || 0), 0);
      const platformFee = totalEarnings * 0.1; // 10% of total earnings
      const income = totalEarnings - platformFee; // Driver's net income

      const stats = {
        completedRides,
        rejectedRides,
        totalEarnings,
        platformFee,
        income,
      };

      res.status(200).json({ message: "Driver statistics fetched", stats });
    } catch (error) {
      console.error("Error fetching driver statistics:", error.message);
      res.status(500).json({ error: "Failed to fetch driver statistics" });
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
  return erideRouter;
};