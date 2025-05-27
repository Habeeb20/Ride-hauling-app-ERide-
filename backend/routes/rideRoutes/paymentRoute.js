import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { verifyToken } from "../../middleware/verifyToken.js";
import Ride from "../../model/ride/rideSchema.js";

import User from "../../model/auth/authSchema.js";

dotenv.config();
const paymentRouter = express.Router();

paymentRouter.post("/initialize", verifyToken, async (req, res) => {
  try {
    const { rideId } = req.body;
    const userId = req.user?.id || req.user?._id;

    const ride = await Ride.findById(rideId);
    if (!ride || ride.clientId.toString() !== userId || ride.paymentMethod !== "transfer") {
      return res.status(400).json({ error: "Invalid ride or payment method" });
    }
    if (!['accepted', 'in_progress'].includes(ride.status)) {
      return res.status(400).json({ error: "Ride not in payable state" });
    }

    const user = await User.findById(userId);
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return res.status(500).json({ error: "Payment configuration missing" });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: ride.finalPrice * 100, // Paystack uses kobo
        reference: `ride_${ride._id}_${Date.now()}`,
        metadata: { rideId: ride._id.toString() },
      },
      { headers: { Authorization: `Bearer ${paystackSecret}` } }
    );

    res.status(200).json({
      message: "Payment initialized",
      data: response.data.data,
    });
  } catch (error) {
    console.error("Error initializing payment:", error.message);
    res.status(500).json({ error: "Failed to initialize payment" });
  }
});

paymentRouter.post("/verify", async (req, res) => {
  try {
    const { reference } = req.body;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return res.status(500).json({ error: "Payment configuration missing" });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } }
    );

    const data = response.data.data;
    if (data.status === "success") {
      const rideId = data.metadata.rideId;
      const ride = await Ride.findById(rideId);
      if (ride) {
        ride.paymentStatus = "completed";
        await ride.save();

        const io = req.app.get("socketio");
        io.to(ride._id.toString()).emit("paymentConfirmed", { rideId, reference });
      }
    }

    res.status(200).json({
      message: "Payment verified",
      data: response.data.data,
    });
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

export default paymentRouter;