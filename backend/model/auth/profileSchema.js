import mongoose from "mongoose";
import slugify from "slugify";

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "Auth",
      required: true,
      unique: true,
    },
    userEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isDriver: {
      type: Boolean,
      required: true,
    },
    question: {
      type: String,
      enum: ["student", "passenger", ""],
      required: function () {
        return !this.isDriver;
      },
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    location: {
      type: Object,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      minlength: 11,
      maxlength: 11,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    schoolId: {
      type: String,
      required: function () {
        return !this.isDriver && this.question === "student";
      },
    },
    carDetails: {
      type: Object,
      required: function () {
        return this.isDriver;
      },
    },
    carPicture: {
      type: String,
      required: function () {
        return this.isDriver;
      },
    },
    driverLicense: {
      type: String,
      required: function () {
        return this.isDriver;
      },
    },
    certificateTraining: {
      type: String,
      required: function () {
        return this.isDriver;
      },
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
      required: function () {
        return this.isDriver;
      },
    },
    YOE: {
      type: String,
      required: function () {
        return this.isDriver;
      },
    },
    currentLocation: {
      type: String,
      required: function () {
        return this.isDriver;
      },
    },
    languageSpoken: {
      type: String,
      required: function () {
        return this.isDriver;
      },
    },
    gearType: {
      type: String,
      enum: ["manual", "automatic", "both"],
      required: function () {
        return this.isDriver;
      },
    },
    vehicleType: {
      type: String,
      enum: ["car", "jeep", "mini-bus", "bus", "trailer"],
      required: function () {
        return this.isDriver;
      },
    },
    driverRoles: {
      type: [String],
      enum: ["ride-hauling", "airport", "chartered", "hired"],
      required: function () {
        return this.isDriver;
      },
      default:"ride-hauling",
      // validate: {
      //   validator: function (v) {
      //     return v.length > 0;
      //   },
      //   message: "At least one driver role must be selected",
      // },
    },
    interstate: {
      type: Boolean,
      required: function () {
        return this.isDriver;
      },
    },
    availableToBeHiredDetails: {
      type: {
        durationType: {
          type: String,
          enum: [
            "day",
            "days",
            "week",
            "weeks",
            "month",
            "months",
            "permanent",
            "temporary",
          ],
          required: true,
        },
        durationValue: {
          type: Number,
          min: 1,
          required: function () {
            return [
              "day",
              "days",
              "week",
              "weeks",
              "month",
              "months",
            ].includes(this.durationType);
          },
        },
        minSalary: {
          type: Number,
          min: 0,
          required: true,
        },
        interstateTravel: {
          type: Boolean,
          required: true,
        },
        typeOfCar: {
          type: String,
          enum: ["car", "jeep", "mini-bus", "bus", "trailer"],
          required: true,
        },
        typeOfTransmission: {
          type: String,
          enum: ["automatic", "manual", "both"],
          required: true,
        },
        choice: {
          type: String,
          enum: ["private with accommodation", "private with no accommodation", "commercial with accommodation", "commercial with no accommodation"],
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: function () {
            return this.durationType !== "permanent";
          },
        },
        timeToStart: {
          type: String,
          required: true,
          // match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/,
        },
      },
      required: function () {
        return this.isDriver && this.driverRoles.includes("hired");
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    ratings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate slug from userEmail
profileSchema.pre("save", async function (next) {
  if (this.isModified("userEmail")) {
    let baseSlug = slugify(this.userEmail, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    // Ensure slug uniqueness
    while (await mongoose.models.Profile.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    this.slug = slug;
  }
  next();
});

export default mongoose.model("Profile", profileSchema);
