import jwt from "jsonwebtoken"
import  User from "../../model/auth/authSchema.js"
import AirportService from "../../model/delivery/airport.js"
import bcrypt from "bcrypt"

import cloudinary from "cloudinary"

import express from "express"
import { verifyToken } from "../../middleware/verifyToken.js"

const router = express.Router()
router.post("/request", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      mode,
      state,
      airportName,
      homeAddress,
      date,
      time,
      passengers,
      distance,
      duration,
      price,
    } = req.body;

    const service = new AirportService({
      userId: req.user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phoneNumber: user.phoneNumber,
      mode,
      state,
      airportName,
      homeAddress,
      date,
      time,
      passengers,
      distance,
      duration,
      price,
    });

    await service.save();
    res.status(201).json({ message: "Airport service request created successfully", service });
  } catch (error) {
    console.error("Error creating airport service:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/getrequest", verifyToken, async(req, res) => {
  const userId = req.user.id

  try {
    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(404).json({
        message: "user not found"
      })
    }

    const airport = await AirportService.find({})

    return res.status(200).json(airport)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:"an error occurred"})
  }
})

export default router












// import jwt from "jsonwebtoken"
// import  User from "../../model/auth/authSchema.js"
// import AirportService from "../../model/delivery/airport.js"
// import bcrypt from "bcrypt"

// import cloudinary from "cloudinary"

// import express from "express"
// import { verifyToken } from "../../middleware/verifyToken.js"
// import adminRequestRoute from "../admin/adminRequest.js"
// const router = express.Router()


// router.post("/request", verifyToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const {
//       mode,
//       state,
//       airportName,
//       homeAddress,
//       date,
//       time,
//       passengers,
//       distance,
//       duration,
//       price,
//     } = req.body;

//     const service = new AirportService({
//       userId: req.user.id,
//       fullName: `${user.firstName} ${user.lastName}`,
//       email: user.email,
//       phoneNumber: user.phoneNumber,
//       mode,
//       state,
//       airportName,
//       homeAddress,
//       date,
//       time,
//       passengers,
//       distance,
//       duration,
//       price,
//     });

//     await service.save();
//     res.status(201).json({ message: "Airport service request created successfully", service });
//   } catch (error) {
//     console.error("Error creating airport service:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.use("/airport", adminRequestRoute);

// export default router








