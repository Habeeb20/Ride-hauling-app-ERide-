import User from "../../model/auth/authSchema.js";
import Profile from "../../model/auth/profileSchema.js";
import express from "express"
import { verifyToken } from "../../middleware/verifyToken.js";

import cloudinary from "cloudinary"


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
      profilePicture, // Now expecting a URL from frontend
      schoolIdUrl,       // Now expecting a URL from frontend (if applicable)
      carPicture,     // Now expecting a URL from frontend (if applicable)
      driverLicense   // Now expecting a URL from frontend (if applicable)
    } = req.body;
  
    try {
      console.log("Request Body:", req.body);
  
      // Validate required fields
      if (!userEmail  || !location || !phoneNumber || !profilePicture || !gender) {
        return res.status(400).json({
          status: false,
          message: "Missing required fields: userEmail, role, location, phoneNumber, or profilePictureUrl",
        });
      }
  
   
  
      if (phoneNumber.length > 11) {
        return res.status(400).json({ message: "Phone number should not exceed 11 characters" });
      }
      if (phoneNumber.length < 11) {
        return res.status(400).json({ message: "Phone number shouldn't be less than 11 characters" });
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
          message: "Invalid or missing role in user profile. Role must be 'passenger' or 'driver'",
        });
      }
  
      let parsedLocation;
      try {
        parsedLocation = JSON.parse(location);
        if (!parsedLocation.state || !parsedLocation.lga || !parsedLocation.address) {
          return res.status(400).json({
            status: false,
            message: "Location must include state,lga and address",
          });
        }
      } catch (e) {
        return res.status(400).json({
          status: false,
          message: "Invalid location JSON format",
        });
      }
  
      // Base profile data
      const profileData = {
        userEmail,
        userId: user._id,
        gender,
        location: parsedLocation,
        phoneNumber,
        profilePicture, // Directly use the URL from frontend
      };
  
      // Handle passenger role
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
              message: "School ID URL is required for student passengers",
            });
          }
          profileData.schoolIdUrl = schoolIdUrl; // Use the URL from frontend
        }
      }
  
      // Handle driver role
      if (role === "driver") {
        if (!carPicture) {
          return res.status(400).json({
            status: false,
            message: "Car picture URL is required for drivers",
          });
        }
        if (!driverLicense) {
          return res.status(400).json({
            status: false,
            message: "Driver's license URL is required",
          });
        }
        profileData.carPicture = carPicture;     // Use the URL from frontend
        profileData.driverLicense = driverLicense; // Use the URL from frontend
  
        if (!carDetails) {
          return res.status(400).json({
            status: false,
            message: "carDetails is required for drivers",
          });
        }
  
        let parsedCarDetails;
        try {
          parsedCarDetails = JSON.parse(carDetails);
          const requiredFields = ["model", "product", "year", "color", "plateNumber"];
          const missingFields = requiredFields.filter((field) => !parsedCarDetails[field]);
          if (missingFields.length > 0) {
            return res.status(400).json({
              status: false,
              message: `Missing required car details: ${missingFields.join(", ")}`,
            });
          }
        } catch (e) {
          return res.status(400).json({
            status: false,
            message: "Invalid carDetails JSON format",
          });
        }
        profileData.carDetails = parsedCarDetails;
      }
  
      // Save profile
      const profile = new Profile(profileData);
      await profile.save();
  
      res.status(201).json({
        status: true,
        message: "Profile created successfully",
        role,
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
        status: false,
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

  

  export default profileRoute


































  


//   const express = require("express");
// const Profile = require("../models/Profile"); // Adjust path as needed
// const User = require("../models/User"); // Adjust path as needed

// const profileRoute = express.Router();

// profileRoute.post("/createprofile", async (req, res) => {
//   const {
//     userEmail,
//     location,
//     phoneNumber,
//     carDetails,
//     question,
//     profilePicture,
//     schoolIdUrl,
//     carPicture,
//     driverLicense,
//   } = req.body;

//   try {
//     console.log("Request Body:", req.body);

//     // Validate required fields
//     if (!userEmail || !location || !phoneNumber || !profilePicture) {
//       return res.status(400).json({
//         status: false,
//         message: "Missing required fields: userEmail, location, phoneNumber, or profilePicture",
//       });
//     }

//     // Validate phone number length
//     if (phoneNumber.length > 11) {
//       return res.status(400).json({
//         status: false,
//         message: "Phone number should not exceed 11 characters",
//       });
//     }
//     if (phoneNumber.length < 11) {
//       return res.status(400).json({
//         status: false,
//         message: "Phone number shouldn't be less than 11 characters",
//       });
//     }

//     // Find user by email to get role
//     const user = await User.findOne({ email: userEmail });
//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     // Get role from User model
//     const role = user.role;
//     if (!role || !["passenger", "driver"].includes(role)) {
//       return res.status(400).json({
//         status: false,
//         message: "Invalid or missing role in user profile. Role must be 'passenger' or 'driver'",
//       });
//     }

//     // Parse and validate location
//     let parsedLocation;
//     try {
//       parsedLocation = JSON.parse(location);
//       if (!parsedLocation.state || !parsedLocation.lga || !parsedLocation.address) {
//         return res.status(400).json({
//           status: false,
//           message: "Location must include state, lga, and address",
//         });
//       }
//     } catch (e) {
//       return res.status(400).json({
//         status: false,
//         message: "Invalid location JSON format",
//       });
//     }

//     // Base profile data
//     const profileData = {
//       userEmail,
//       userId: user._id,
//       role, // From User model
//       location: parsedLocation,
//       phoneNumber,
//       profilePicture,
//     };

//     // Handle passenger role
//     if (role === "passenger") {
//       if (!question || !["student", "passenger"].includes(question)) {
//         return res.status(400).json({
//           status: false,
//           message: "Question is required for passenger role and must be 'student' or 'passenger'",
//         });
//       }
//       profileData.question = question;

//       if (question === "student") {
//         if (!schoolIdUrl) {
//           return res.status(400).json({
//             status: false,
//             message: "School ID URL is required for student passengers",
//           });
//         }
//         profileData.schoolIdUrl = schoolIdUrl;
//       }
//     }

//     // Handle driver role
//     if (role === "driver") {
//       if (!carPicture) {
//         return res.status(400).json({
//           status: false,
//           message: "Car picture URL is required for drivers",
//         });
//       }
//       if (!driverLicense) {
//         return res.status(400).json({
//           status: false,
//           message: "Driver's license URL is required",
//         });
//       }
//       profileData.carPicture = carPicture;
//       profileData.driverLicense = driverLicense;

//       if (!carDetails) {
//         return res.status(400).json({
//           status: false,
//           message: "carDetails is required for drivers",
//         });
//       }

//       let parsedCarDetails;
//       try {
//         parsedCarDetails = JSON.parse(carDetails);
//         const requiredFields = ["model", "product", "year", "color", "plateNumber"];
//         const missingFields = requiredFields.filter((field) => !parsedCarDetails[field]);
//         if (missingFields.length > 0) {
//           return res.status(400).json({
//             status: false,
//             message: `Missing required car details: ${missingFields.join(", ")}`,
//           });
//         }
//       } catch (e) {
//         return res.status(400).json({
//           status: false,
//           message: "Invalid carDetails JSON format",
//         });
//       }
//       profileData.carDetails = parsedCarDetails;
//     }

//     // Save profile
//     const profile = new Profile(profileData);
//     await profile.save();

//     res.status(201).json({
//       status: true,
//       message: "Profile created successfully",
//       role,
//       data: profile,
//     });
//   } catch (error) {
//     console.error("Error in /createprofile:", error);

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         status: false,
//         message: "Validation error: " + error.message,
//       });
//     }

//     res.status(500).json({
//       status: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

// module.exports = profileRoute;