import User from "../../model/auth/authSchema.js";
import Profile from "../../model/auth/profileSchema.js";
import express from "express"
import { verifyToken } from "../../middleware/verifyToken.js";
import { isDriver } from "../../middleware/verifyToken.js";
import cloudinary from "cloudinary"
import Ride from "../../model/ride/rideSchema.js"
import asyncHandler from "express-async-handler"
import dotenv from "dotenv"

dotenv.config()


const profileRoute = express.Router()





cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});






profileRoute.post("/createprofile", async (req, res) => {
  const {
    userEmail,
    gender,
    location,
    phoneNumber,
    carDetails,
    question,
    profilePicture,
    schoolIdUrl,
    carPicture,
    driverLicense,
    certificateTraining,
    maritalStatus,
    YOE,
    currentLocation,
    languageSpoken,
    gearType,
    vehicleType,
    driverRoles,
    interstate,
    availableToBeHiredDetails,
  } = req.body;

  try {
    console.log("Request Body:", req.body);

    // Validate required fields
    if (!userEmail || !location || !phoneNumber || !gender) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields: userEmail, location, phoneNumber, or gender",
      });
    }

    if (phoneNumber.length !== 11) {
      return res.status(400).json({
        status: false,
        message: "Phone number must be exactly 11 characters",
      });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const role = user.role;
    if (!role || !["client", "driver"].includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Invalid role. Must be 'client' or 'driver'",
      });
    }

    let parsedLocation;
    try {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      if (!parsedLocation.state || !parsedLocation.lga || !parsedLocation.address) {
        return res.status(400).json({
          status: false,
          message: "Location must include state, lga, and address",
        });
      }
    } catch (e) {
      return res.status(400).json({
        status: false,
        message: "Invalid location format",
      });
    }

    // Base profile data
    const profileData = {
      userEmail: userEmail,
      userId: user._id,
      gender,
      location: parsedLocation,
      phoneNumber,
      profilePicture,
      isDriver: role === "driver",
    };

    // Handle client role
    if (role === "client") {
      if (!question || !["student", "passenger"].includes(question)) {
        return res.status(400).json({
          status: false,
          message: "Question is required for client role and must be 'student' or 'passenger'",
        });
      }
      profileData.question = question;

      if (question === "student") {
        if (!schoolIdUrl) {
          return res.status(400).json({
            status: false,
            message: "School ID URL is required for student clients",
          });
        }
        profileData.schoolIdUrl = schoolIdUrl;
      }
    }

    // Handle driver role
    if (role === "driver") {
      if (!carPicture || !driverLicense || !certificateTraining || !maritalStatus || !YOE ||
          !currentLocation || !languageSpoken || !gearType || !vehicleType) {
        return res.status(400).json({
          status: false,
          message: "Missing required driver fields: carPicture, driverLicense, certificateTraining, maritalStatus, YOE, currentLocation, languageSpoken, gearType, or vehicleType",
        });
      }

      if (!Array.isArray(driverRoles) || driverRoles.length === 0 ||
          !driverRoles.every(role => ["ride-hauling", "airport", "chartered", "hired"].includes(role))) {
        return res.status(400).json({
          status: false,
          message: "driverRoles must be a non-empty array containing valid roles: ride-hauling, airport, chartered, hired",
        });
      }

      if (typeof interstate !== 'boolean') {
        return res.status(400).json({
          status: false,
          message: "interstate must be a boolean value",
        });
      }

      let parsedCarDetails;
      try {
        parsedCarDetails = typeof carDetails === 'string' ? JSON.parse(carDetails) : carDetails;
        const requiredFields = ["model", "product", "year", "color", "plateNumber"];
        const missingFields = requiredFields.filter(field => !parsedCarDetails[field]);
        if (missingFields.length > 0) {
          return res.status(400).json({
            status: false,
            message: `Missing required car details: ${missingFields.join(", ")}`,
          });
        }
      } catch (e) {
        return res.status(400).json({
          status: false,
          message: "Invalid carDetails format",
        });
      }

      profileData.carPicture = carPicture;
      profileData.driverLicense = driverLicense;
      profileData.certificateTraining = certificateTraining;
      profileData.maritalStatus = maritalStatus;
      profileData.YOE = YOE;
      profileData.currentLocation = currentLocation;
      profileData.languageSpoken = languageSpoken;
      profileData.gearType = gearType;
      profileData.vehicleType = vehicleType;
      profileData.carDetails = parsedCarDetails;
      profileData.driverRoles = driverRoles;
      profileData.interstate = interstate;

      if (driverRoles.includes("hired")) {
        if (!availableToBeHiredDetails) {
          return res.status(400).json({
            status: false,
            message: "availableToBeHiredDetails is required when hired role is selected",
          });
        }

        let parsedHiredDetails;
        try {
          parsedHiredDetails = typeof availableToBeHiredDetails === 'string' ? JSON.parse(availableToBeHiredDetails) : availableToBeHiredDetails;
          const requiredFields = [
            "durationType",
            "minSalary",
            "interstateTravel",
            "typeOfCar",
            "typeOfTransmission",
            "choice",
            "startDate",
            "timeToStart"
          ];
          const missingFields = requiredFields.filter(field => parsedHiredDetails[field] === undefined || parsedHiredDetails[field] === "");
          if (missingFields.length > 0) {
            return res.status(400).json({
              status: false,
              message: `Missing required hired details: ${missingFields.join(", ")}`,
            });
          }

          // Validate durationType
          if (!["day", "days", "week", "weeks", "month", "months", "permanent", "temporary"].includes(parsedHiredDetails.durationType)) {
            return res.status(400).json({
              status: false,
              message: "Invalid durationType. Must be one of: day, days, week, weeks, month, months, permanent, temporary",
            });
          }

          // Validate durationValue
          if (["day", "days", "week", "weeks", "month", "months"].includes(parsedHiredDetails.durationType) &&
              (!parsedHiredDetails.durationValue || parsedHiredDetails.durationValue < 1)) {
            return res.status(400).json({
              status: false,
              message: "durationValue is required and must be at least 1 for non-permanent/temporary durations",
            });
          }

          // Validate minSalary
          if (parsedHiredDetails.minSalary < 0) {
            return res.status(400).json({
              status: false,
              message: "minSalary must be a non-negative number",
            });
          }

          // Validate interstateTravel
          if (typeof parsedHiredDetails.interstateTravel !== 'boolean') {
            return res.status(400).json({
              status: false,
              message: "interstateTravel must be a boolean value",
            });
          }

          // Validate typeOfCar
          if (!["car", "jeep", "mini-bus", "bus", "trailer"].includes(parsedHiredDetails.typeOfCar)) {
            return res.status(400).json({
              status: false,
              message: "typeOfCar must be one of: car, jeep, mini-bus, bus, trailer",
            });
          }

          // Validate typeOfTransmission
          if (!["automatic", "manual", "both"].includes(parsedHiredDetails.typeOfTransmission)) {
            return res.status(400).json({
              status: false,
              message: "typeOfTransmission must be one of: automatic, manual, both",
            });
          }

          // Validate choice
          if (!["private", "commercial"].includes(parsedHiredDetails.choice)) {
            return res.status(400).json({
              status: false,
              message: "choice must be one of: private, commercial",
            });
          }

          // Validate startDate
          if (!parsedHiredDetails.startDate || isNaN(new Date(parsedHiredDetails.startDate).getTime())) {
            return res.status(400).json({
              status: false,
              message: "Invalid startDate format",
            });
          }

          // Validate endDate
          if (parsedHiredDetails.durationType !== "permanent" && (!parsedHiredDetails.endDate || isNaN(new Date(parsedHiredDetails.endDate).getTime()))) {
            return res.status(400).json({
              status: false,
              message: "endDate is required and must be a valid date for non-permanent duration",
            });
          }

          // Validate timeToStart
          // if (!parsedHiredDetails.timeToStart || !/^[0-1]?[0-9]|2[0-3]:[0-5][0-9] (AM|PM)$/.test(parsedHiredDetails.timeToStart)) {
          //   return res.status(400).json({
          //     status: false,
          //     message: "timeToStart must be in valid format (e.g., '09:00 AM')",
          //   });
          // }

        } catch (e) {
          return res.status(400).json({
            status: false,
            message: "Invalid availableToBeHiredDetails format",
          });
        }

        profileData.availableToBeHiredDetails = parsedHiredDetails;
      }
    }

    // Save profile
    const profile = new Profile(profileData);
    await profile.save();

    res.status(201).json({
      status: true,
      message: "Profile created successfully",
      isDriver: role === "driver",
      data: profile,
    });
  } catch (error) {
    console.error("Error in /createprofile:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: "Validation error: " + error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
});









  profileRoute.get("/getprofile", verifyToken, async(req, res) => {
    const id = req.user.id
    try {
        const user = await User.findOne({id})

        if(!user){
            return res.status(404).json({
                status: false,
                message: "user account not found"
            })
        }

        const myuserId = user._id

        const profile = await Profile.findOne({userId: myuserId})
        if(!profile){
            return res.status(404).json({
                status: false,
                message: "profile data not found"
            })
        }

        return res.status(200).json({
            status: true,
            message: "successfully retrieved",
            profile
        })



    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: "an error occurred from the server"
        })
    }
})


profileRoute.put("/update", async (req, res) => {
    const { userId, firstName, lastName, email, phoneNumber, location } = req.body;
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, email },
        { new: true }
      );
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { phoneNumber, location },
        { new: true }
      ).populate("userId", "firstName lastName email");
      res.status(200).json({ status: true, data: profile });
    } catch (error) {
      res.status(500).json({ status: false, message: "Failed to update profile" });
    }
  });



  profileRoute.get("/:slug/shares", async(req, res) => {
    try {
      const {slug} = req.params
      const profile = await Profile.findOne({slug});
      if(!profile){
        return res.status(404).json({message: "profile not found"})
      }
      res.status(200).json({shareCount:profile.shares})
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  })
  
  
  ///increment shares
  profileRoute.post("/:slug/shares", async(req, res) => {
    try {
      const {slug} = req.params;
      const profile =  await Profile.findOneAndUpdate(
        {slug},
        {$inc: {shares: 1}},
        {new: true}
      )
      if(!profile){
        return res.status(404).json({message: "profile not found"})
      }
  
      return res.status(200).json({
        message: "shares count updated", shareCount: profile.shares
      })
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  })
  
  ///increment click
  profileRoute.post("/:slug/click", async(req, res) => {
      try {
        const {slug} = req.params;
        const profile =await Profile.findOneAndUpdate(
          {slug},
          {$inc:{clicks: 1}},
          {new: true}
        )
  
        if(!profile){
          return res.status(404).json({
            message: "profile not found"
          })
        }
  
        return res.status(200).json({message: "clicks successfully updated"})
  
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
  } )
  
  
  //get clicks
  profileRoute.get("/get-clicks/:slug", async(req, res) => {
    try {
      const {slug} = req.params
  
      const profile = await Profile.findOne({slug})
      if(!profile){
        return res.status(404).json({message: "profile not found"})
      }
  
      res.status(200).json({clicks:profile.clicks})
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  })
  
  
  //get every clicks
  profileRoute.get("/get-clicks", async(req, res) => {
     try {
      const profile = await Profile.find({}, "profile clicks")
  
      return res.status(200).json(profile)
     } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
     }
  })
  
  
  
  
  profileRoute.get("/aprofile/:slug", async(req, res) => {
    try {
      const slug = req.params.slug;
  
      const profile = await Profile.findOne({slug})
          .populate("userId", 'firstName lastName phone email role isBlacklisted verificationStatus uniqueNumber')
          .lean()
  
      if(!profile){
        console.log("profile not found")
        return res.status(404).json({
          message: "profile not found"
        })
      }
      console.log(`Profile found for slug: ${slug}`, profile);
      return res.status(200).json({
        message: "profile is available",
        profile
      })
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  })
  
  

// Toggle availableToBeHired and save details




profileRoute.post("/availability", verifyToken, isDriver, async (req, res) => {
  const { availableToBeHired, durationType, durationValue, minSalary } = req.body;

  try {
    if (typeof availableToBeHired !== "boolean") {
      return res.status(400).json({ error: "availableToBeHired must be a boolean" });
    }

    const profile = req.profile;
    console.log("Profile before update:", profile);

    if (!availableToBeHired) {
      profile.availableToBeHired = false;
      profile.availableToBeHiredDetails = undefined;
    } else {
      if (!durationType || minSalary == null) {
        return res.status(400).json({ error: "durationType and minSalary are required when enabling availability" });
      }

      const validDurationTypes = ["day", "days", "week", "weeks", "month", "months", "permanent", "temporary"];
      if (!validDurationTypes.includes(durationType)) {
        return res.status(400).json({ error: "Invalid durationType" });
      }

      if (
        ["day", "days", "week", "weeks", "month", "months"].includes(durationType) &&
        (!durationValue || durationValue < 1)
      ) {
        return res.status(400).json({ error: "durationValue is required and must be at least 1 for this durationType" });
      }

      profile.availableToBeHired = true;
      profile.availableToBeHiredDetails = {
        durationType,
        durationValue: durationValue ? Number(durationValue) : null,
        minSalary: Number(minSalary),
        startDate: new Date(),
      };

      // Mark nested field as modified
      profile.markModified("availableToBeHiredDetails");
    }

    await profile.save();
   


    const savedProfile = await Profile.findOne({ userId: req.user._id });


        if (!savedProfile) {
      return res.status(500).json({ error: "Failed to retrieve updated profile" });
    }

    res.status(200).json({
      message: "Availability updated successfully",
      availableToBeHired: profile.availableToBeHired,
      availableToBeHiredDetails: savedProfile.availableToBeHired,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update availability", details: error.message });
  }
});





// Get driver availability




// routes/profileRoute.js (add to existing file)
profileRoute.get("/availability", verifyToken, isDriver, async (req, res) => {
  try {
    const profile = req.profile;
    res.status(200).json({
      availableToBeHired: profile.availableToBeHired,
      availableToBeHiredDetails: profile.availableToBeHiredDetails,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Failed to fetch availability", details: error.message });
  }
});



// profileRoute.get("/availabledrivers", verifyToken, async (req, res) => {
//   try {
  
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: "User account not found" });
//     }

  
//     const profileDrivers = await Profile.find({ availableToBeHired: true })
//       .select("userId phoneNumber stateOfOrigin LGA availableToBeHired availableToBeHiredDetails location profilePicture")
//       .populate("userId", "firstName lastName email uniqueNumber"); 

   

//     // Return available drivers
//     return res.status(200).json({
//       message: "Available drivers retrieved successfully",
//       drivers: profileDrivers
//     });
//   } catch (error) {
//     console.error("Error fetching available drivers:", error);
//     return res.status(500).json({ message: "An error occurred on the server" });
//   }
// });



profileRoute.get("/availabledrivers", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    const profileDrivers = await Profile.find({ driverRoles: "hired", isDriver: true })
      .select("userId profilePicture phoneNumber location currentLocation vehicleType gearType availableToBeHiredDetails")
      .populate("userId", "firstName lastName email uniqueNumber");

    if (profileDrivers.length === 0) {
      return res.status(404).json({ message: "No available drivers found" });
    }

    return res.status(200).json({
      message: "Available drivers retrieved successfully",
      drivers: profileDrivers,
    });
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    return res.status(500).json({ message: "An error occurred on the server" });
  }
});



profileRoute.put('/update-roles', verifyToken, async (req, res) => {
  try {
    const { driverRoles, availableToBeHiredDetails } = req.body;
    const validRoles = ['ride-hauling', 'airport', 'chartered', 'hired'];
    
    // Validate roles
    if (!Array.isArray(driverRoles) || !driverRoles.every(role => validRoles.includes(role))) {
      return res.status(400).json({ error: 'Invalid roles selected' });
    }
    
    // Validate availableToBeHiredDetails if hired role is selected
    if (driverRoles.includes('hired') && !availableToBeHiredDetails) {
      return res.status(400).json({ error: 'Hired details required for hired role' });
    }

    const updateData = {
      driverRoles,
      isDriver: driverRoles.length > 0,
    };
    
    if (driverRoles.includes('hired')) {
      updateData.availableToBeHiredDetails = availableToBeHiredDetails;
    } else {
      updateData.availableToBeHiredDetails = null; // Clear if not hired
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ message: 'Roles and details updated', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});





profileRoute.get('/ride-requests', verifyToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile || !profile.isDriver) {
      return res.status(403).json({ error: 'Not a driver' });
    }
    const allowedRideTypes = profile.driverRoles;
    const rides = await Ride.find({
      rideType: { $in: allowedRideTypes },
      status: 'pending',
    });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});





profileRoute.get(
  "/me",
  verifyToken,
  asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  })
);


profileRoute.put(
  "/me",
  verifyToken,
  asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }


    const updates = req.body;


    const cloudinaryFields = [
      "profilePicture",
      "schoolId",
      "carPicture",
      "driverLicense",
      "certificateTraining",
    ];
    for (const field of cloudinaryFields) {
      if (updates[field] && !updates[field].startsWith("https://res.cloudinary.com/")) {
        return res.status(400).json({ message: `Invalid Cloudinary URL for ${field}` });
      }
    }

    // Update profile
    Object.assign(profile, updates);
    await profile.save();

    res.status(200).json(profile);
  })
);



profileRoute.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the requester is fetching their own data
    if (id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Fetch user
    const user = await User.findById(id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch profile
    const profile = await Profile.findOne({ userId: id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Combine user and profile data
    const userData = {
      user: {
        _id: user._id,
        email: user.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
      },
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});











  export default profileRoute


















