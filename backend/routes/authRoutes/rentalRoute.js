
import jwt from "jsonwebtoken"
import  User from "../../model/auth/authSchema.js"
import AirportService from "../../model/delivery/airport.js"
import bcrypt from "bcrypt"
import VehicleRental from "../../model/delivery/rental.js"
import cloudinary from "cloudinary"

import express from "express"
import { verifyToken } from "../../middleware/verifyToken.js"



const router = express.Router();
router.post("/request", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      vehicleType,
      startDate,
      startTime,
      returnDate,
      returnTime,
      idCardUrl,
      price,
    } = req.body;

    const rental = new VehicleRental({
      userId: req.user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phoneNumber: user.phoneNumber,
      vehicleType,
      startDate,
      startTime,
      returnDate,
      returnTime,
      idCardUrl,
      price,
    });

    await rental.save();
    res.status(201).json({ message: "Vehicle rental request created successfully", rental });
  } catch (error) {
    console.error("Error creating vehicle rental:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router