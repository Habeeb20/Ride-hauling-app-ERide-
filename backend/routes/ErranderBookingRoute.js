import express from 'express';
import Booking from '../model/booking.js';
import Profile from '../models/Profile.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();


router.post('/', verifyToken, async (req, res) => {
  const { erranderId, pickupAddress, destination, itemName, itemPicture, offeredPrice } = req.body;

  try {
    // Verify errander exists
    const errander = await Profile.findById(erranderId);
    if (!errander) {
      return res.status(404).json({ message: 'Errander not found' });
    }

    // Create booking
    const booking = new Booking({
      erranderId,
      clientId: req.user.userId,
      pickupAddress,
      destination,
      itemName,
      itemPicture,
      offeredPrice,
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;