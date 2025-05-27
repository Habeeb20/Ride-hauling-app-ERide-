import express from "express";
import mongoose from "mongoose";

import Conversation from "../../model/ride/conversationSchema.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import Ride from "../../model/ride/rideSchema.js";

const chatRouter = express.Router();

// Get conversation for a ride
chatRouter.get("/:rideId", verifyToken, async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(rideId)) {
      return res.status(400).json({ status: false, message: "Invalid ride ID" });
    }

    const conversation = await Conversation.findOne({ rideId })
      .populate("clientId", "firstName lastName email")
      .populate("driverId", "firstName lastName email")
      .populate("messages.senderId", "firstName lastName");

    if (!conversation) {
      return res.status(404).json({ status: false, message: "Conversation not found" });
    }

    if (![conversation.clientId._id.toString(), conversation.driverId?.toString()].includes(userId)) {
      return res.status(403).json({ status: false, message: "Unauthorized access" });
    }

    res.json({
      status: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Fetch conversation error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Mark messages as read
chatRouter.put("/:rideId/read", verifyToken, async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(rideId)) {
      return res.status(400).json({ status: false, message: "Invalid ride ID" });
    }

    const conversation = await Conversation.findOne({ rideId });
    if (!conversation) {
      return res.status(404).json({ status: false, message: "Conversation not found" });
    }

    if (![conversation.clientId.toString(), conversation.driverId?.toString()].includes(userId)) {
      return res.status(403).json({ status: false, message: "Unauthorized access" });
    }

    conversation.messages = conversation.messages.map((msg) => {
      if (msg.senderId.toString() !== userId && !msg.isRead) {
        return { ...msg._doc, isRead: true };
      }
      return msg;
    });
    await conversation.save();

    const io = req.app.get("socketio");
    io.to(rideId).emit("messages read", { rideId, userId });

    res.json({
      status: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

export default chatRouter;