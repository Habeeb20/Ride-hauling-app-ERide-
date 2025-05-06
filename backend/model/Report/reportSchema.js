import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  offence: {
    type: String,
    required: true,
    trim: true,
  },
  observation: {
    type: String,
    trim: true,
  },
  gradeOfOffence: {
    type: String,
    required: true,
    enum: ["Minor", "Moderate", "Severe"], 
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});


reportSchema.index({ driver: 1, date: -1 });
reportSchema.index({ client: 1, date: -1 });

export default mongoose.model("Report", reportSchema);