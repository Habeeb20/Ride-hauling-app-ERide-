import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    carInsured: {
      type: Boolean,
      required: true,
    },
    typeOfCar: {
      type: String,
      enum: ["car", "jeep", "mini-bus", "bus", "trailer"],
      required: true,
    },
    accommodationAvailable: {
      type: Boolean,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endDate: {
      type: Date,
    },
    employmentType: {
      type: String,
      enum: ["days", "weeks", "months", "temporary", "a trip", "permanent"],
      required: true,
    },
    tripDetails: {
      type: {
        tripType: {
          type: String,
          enum: ["withinState", "interstate"],
          required: true,
        },
        withinState: {
          state: { type: String },
          pickupAddress: { type: String },
          destinationAddress: { type: String },
          tripOption: {
            type: String,
            enum: ["oneWay", "roundTrip"],
          },
        },
        interstate: {
          pickupState: { type: String },
          pickupAddress: { type: String },
          destinationState: { type: String },
          destinationAddress: { type: String },
          pickupDate: { type: Date },
          pickupTime: { type: String },
          amount: { type: Number, min: 0 },
        },
      },
      required: function () {
        return this.employmentType === "a trip";
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);