
import express from "express";
import Message from "../../model/auth/messageSchema.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const router = express.Router();

router.get("/history/:driverId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const driverId = req.params.driverId;
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: driverId },
        { senderId: driverId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "firstName lastName")
      .populate("receiverId", "firstName lastName");
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching message history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;