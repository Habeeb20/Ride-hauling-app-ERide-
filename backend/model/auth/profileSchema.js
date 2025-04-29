import mongoose from "mongoose";
import slugify from "slugify";
const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    
    },

    userEmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
  
    profilePicture:{
        type:String,
       
    },
    gender: {
      type:String,
      required: true,
  },
    isOnline: { type: Boolean, default: false },
    question: {
      type: String,
      enum: ["student", "passenger"],
      required: function () {
        return this.role === "client";
      },
    },
    schoolIdUrl: {
      type: String, 
      required: function () {
        return this.role === "client" && this.question === "student";
      },
    },
    driverLicense: {
      type: String, 
      required: function () {
        return this.role === "driver";
      },
    },
    carDetails: {
      model: {
        type: String,
        required: function () {
          return this.role === "driver";
        },
      },
      product: {
        type: String,
        required: function () {
          return this.role === "driver";
        },
      },
      year: {
        type: Number,
        required: function () {
          return this.role === "driver";
        },
      },
      color: {
        type: String,
        required: function () {
          return this.role === "driver";
        },
      },
      plateNumber: {
        type: String,
        required: function () {
          return this.role === "driver";
        },
      },
    },
  
    carPicture:{
        type:String,
        required: function(){
            return this.role === "driver"
        }
    },

    available:{
      type: Boolean,
      default: true

    },
    rating: { type: Number, default: 0 }, // Average rating
    rideCount: { type: Number, default: 0 },
    location: {
      state: { type: String, required: true },
      lga: { type: String, required: true },
      address: { type:String, required: true },
      coordinates: { lat: Number, lng: Number }, 
    },
    slug: { type: String, unique: true },
comments: [
    {
      name: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  clicks: { type: Number, default: 0 }, 
  shares: { type: Number, default: 0 },
    phoneNumber: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

profileSchema.pre("save", function(next){
  if(!this.slug){
    this.slug=slugify(this.userEmail, {lower: true, strict: true})
  }
  next()
})


export default mongoose.model("Profile", profileSchema);









