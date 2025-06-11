import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  erranderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true,
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  itemPicture: {
    type: String,
  },
  offeredPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);