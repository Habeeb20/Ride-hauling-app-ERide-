import mongoose, { Types } from "mongoose";
import slugify from "slugify";

const authSchema = new mongoose.Schema({
 
  profileId:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "Profile"
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: {
    type: String,
    required: true,
    enum: ["driver", "client", "admin"],
  },
  
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    lastUpdated: { type: Date, default: Date.now }
},

verificationStatus: {
  type: String,
  enum: ["unverified", "verified"],
  default: function () {
    return this.role === "driver" || this.role === "client" ? "unverified" : "verified";
  },
},
    status: { type: String, enum: ['active', 'blocked', 'pending'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    registrationDate: { type: Date, default: Date.now },
    uniqueNumber: { type: String, unique: true },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    slug: {
      type: String,
      unique: true,
    },
    isBlacklisted: {
      type: Boolean,
      default: false, 
    },
    isFeatured: {
      type: Boolean,
      default: false, 
    },

  }, {timestamps: true})


  
authSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.email, { lower: true, strict: true });
  }
  next();
});

authSchema.methods.verifyErrander = function () {
      if (this.role !== "driver" || this.role !== "client") {
        throw new Error("Only erranders  or messengers can be verified");
      }
      this.verificationStatus = "verified";
      return this.save();
    };
    
 authSchema.methods.blacklistErrander = function () {
      if (this.role !== "driver" || this.role !== "client") {
        throw new Error("Only erranders or messengers can be blacklisted");
      }
      this.isBlacklisted = true;
      return this.save();
    };
    
    
authSchema.methods.unblacklistErrander = function () {
      if (this.role !== "driver" || this.role !== "client") {
        throw new Error("Only erranders or messengers can be unblacklisted");
      }
      this.isBlacklisted = false;
      return this.save();
    };
    


export default mongoose.model("Auth", authSchema)