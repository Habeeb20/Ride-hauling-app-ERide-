import express from "express";
import jwt from "jsonwebtoken";
import Profile from "../model/auth/profileSchema.js";
import Booking from "../model/booking.js";


import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "./authRoutes/authRoute.js";


const router = express.Router();



// Create a booking
router.post("/create", verifyToken, async (req, res) => {
  try {
    const {
      driverId,
      carInsured,
      typeOfCar,
      accommodationAvailable,
      startDate,
      startTime,
      endDate,
      employmentType,
      tripType,
      withinState,
      interstate,
    } = req.body;

    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Client profile not found" });
    }

    const driverProfile = await Profile.findOne({ userId: driverId });
    if (!driverProfile || !driverProfile.driverRoles.includes("hired")) {
      return res.status(400).json({ message: "Invalid driver" });
    }

    const bookingData = {
      clientId: req.user.id,
      driverId,
      carInsured,
      typeOfCar,
      accommodationAvailable,
      startDate,
      startTime,
      endDate,
      employmentType,
    };

    if (employmentType === "a trip") {
      bookingData.tripDetails = { tripType };
      if (tripType === "withinState") {
        bookingData.tripDetails.withinState = withinState;
      } else if (tripType === "interstate") {
        bookingData.tripDetails.interstate = interstate;
      }
    }

    const booking = new Booking(bookingData);
    await booking.save();
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all bookings for admin dashboard
router.get("/admin/bookings", verifyToken, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("clientId", "firstName lastName email")
      .populate("driverId", "firstName lastName email");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;