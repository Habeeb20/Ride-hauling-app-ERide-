import express from "express"
import AdminAirportRequest from "../admin/adminRequest.js"

import User from "../authRoutes/authRoute.js"
import {verifyToken} from "../../middleware/verifyToken.js"
const router = express.Router();

router.post("/admin-request", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      userId,
      fullName,
      email,
      phoneNumber,
      mode,
      state,
      airportName,
      homeAddress,
      date,
      time,
      passengers,
      distance,
      duration,
      price,
    } = req.body;

    if (userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const adminRequest = new AdminAirportRequest({
      userId,
      fullName,
      email,
      phoneNumber,
      mode,
      state,
      airportName,
      homeAddress,
      date,
      time,
      passengers,
      distance,
      duration,
      price,
    });

    await adminRequest.save();
    res.status(201).json({ message: "Airport request sent to admin successfully", adminRequest });
  } catch (error) {
    console.error("Error sending airport request to admin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router