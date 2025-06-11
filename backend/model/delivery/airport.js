import mongoose from "mongoose";

const airportServiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  mode: { type: String, enum: ["pickup", "dropoff"], required: true },
  state: { type: String, required: true },
  airportName: { type: String, required: true },
  homeAddress: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  passengers: { type: Number, required: true, min: 1 },
  distance: { type: String },
  duration: { type: String },
  price: { type: Number },
  status: { type: String, enum: ["pending", "accepted", "completed", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AirportService", airportServiceSchema);