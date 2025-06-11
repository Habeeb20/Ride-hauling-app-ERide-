import mongoose from "mongoose";
const vehicleRentalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  vehicleType: { type: String, enum: ["lorry", "van", "trailer"], required: true },
  startDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  returnDate: { type: Date, required: true },
  returnTime: { type: String, required: true },
  idCardUrl: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["pending", "accepted", "completed", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("VehicleRental", vehicleRentalSchema);