import jwt from "jsonwebtoken"
import  User from "../../model/auth/authSchema.js"
import Profile from "../../model/auth/profileSchema.js"
import bcrypt from "bcrypt"
import nodemailer  from "nodemailer"
import crypto from "crypto"
import cloudinary from "cloudinary"
import dotenv from "dotenv"
import Ride from "../../model/ride/rideSchema.js"
import express from "express"
import { verifyToken } from "../../middleware/verifyToken.js"
import { v4 as uuidv4 } from 'uuid';
import mongoose from "mongoose"
dotenv.config()


export const isAdmin = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    console.log(req?.user?.role)
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  };


const authRouter = express.Router()

const transporter = nodemailer.createTransport({
  service:'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
    auth: {
        user:"essentialdevelopers22@gmail.com",
        pass:"jiaxdjpmgndjujhr"
      },
 
})



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });


  const sendOTPEmail = async (email, otp, firstName) => {
    const mailOptions = {
      from: "essentialng23@gmail.com",
      to: email,
      subject: "Verify your email",
      html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - E_Ride</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5; color: #333;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 20px; text-align: center; background-color: customPink; color: white; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                  <h1 style="font-size: 28px; margin: 0; font-weight: bold; font-family: 'Helvetica', sans-serif;">E_Ride</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="font-size: 24px; color: #333; margin-bottom: 20px; font-weight: 600; font-family: 'Helvetica', sans-serif;">Verify Your Email</h2>
                  <p style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 20px;">
                    Hello ${firstName || "there"},
                  </p>
                  <p style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 30px;">
                    Thank you for signing up with E_Ride! To complete your registration and secure your account, please verify your email address by entering the following 6-digit verification code:
                  </p>
                  <div style="text-align: center; margin: 30px 0; background-color: #f0f0f0; padding: 20px; border-radius: 8px;">
                    <span style="display: inline-block; font-size: 32px; font-weight: bold; color: customPink; letter-spacing: 6px; font-family: 'Helvetica', sans-serif;">
                      ${otp}
                    </span>
                  </div>
                  <p style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 20px;">
                    This code will expire in 24 hours for your security. If you didn’t request this verification, please ignore this email or contact our support team at <a href="mailto:support@e-ride.com" style="color: #7E22CE; text-decoration: none; font-weight: 500;">support@e-ride.com</a>.
                  </p>
                  <p style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 30px;">
                    If you have any questions, feel free to reach out to us. We’re here to help you get started with E_Ride!
                  </p>
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:5173/verifyemail?email=${encodeURIComponent(
                      email
                    )}" 
                       style="display: inline-block; padding: 12px 30px; background-color: customPink; color: white; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; font-family: 'Helvetica', sans-serif; transition: background-color 0.3s;">
                      Verify Now
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px; font-family: 'Arial', sans-serif;">
                    © 2025 E_Ride. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
    };
    try {
      const sentMail = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", sentMail);
      return { success: true };
    } catch (error) {
      console.error("Email sending error:", error);
      return { success: false, error: error.message };
    }
  };
  

authRouter.post("/register", async(req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res
            .status(400)
            .json({ status: false, message: "Email already exists" });
        }
    
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const verificationToken = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        const uniqueNumber = `RL-${crypto
          .randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;
        const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      
    
        const newUser = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role,
          verificationToken,
          verificationTokenExpiresAt,
          uniqueNumber,
          userId: uuidv4(),
        });
    
        await newUser.save();
    
        const response = await sendOTPEmail(
          newUser.email,
          verificationToken,
          firstName
        );
        if (!response.success) {
          console.log("Email sending error:", response.error);
          return res
            .status(400)
            .json({ status: false, message: "Failed to send verification email" });
        }
    
        const payload = { user: { id: newUser._id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
    
        return res.status(200).json({
          status: true,
          message: "Successfully registered. Please verify your email.",
          token,
      
        });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ status: false, message: "Server error" });
      }
})

authRouter.post("/verify-email", async(req, res) => {
    try {
        const { email, code } = req.body;
        console.log("Verifying email:", { email, code });
    
        const user = await User.findOne({
          email,
          verificationToken: code,
          verificationTokenExpiresAt: { $gt: Date.now() },
        });
        if (!user) {
          return res
            .status(404)
            .json({
              status: false,
              message: "User not found or invalid verification code",
            });
        }
    
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
    
        const payload = { user: { id: user._id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
        res.json({
          success: true,
          message: "Email verified successfully",
          token,
          user: { id: user._id, email: user.email, isVerified: true, role:user.role },
        });
      } catch (err) {
        console.error("Email verification error:", err);
        res
          .status(500)
          .json({ status: false, message: err.message || "Server error occurred" });
      }  
})

authRouter.post("/send-otp", async(req, res) => {
    try {
        const { email } = req.body;
        console.log("Resending OTP for email:", email);
    
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ status: false, message: "User not found" });
        }
    
        const verificationToken = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    
        user.verificationToken = verificationToken;
        user.verificationTokenExpiresAt = verificationTokenExpiresAt;
        await user.save();
    
        const response = await sendOTPEmail(
          email,
          verificationToken,
          user.firstName
        );
        if (!response.success) {
          console.log("Email sending error:", response.error);
          return res
            .status(400)
            .json({ status: false, message: "Failed to resend verification code" });
        }
    
        res.json({
          status: true,
          message: "Verification code resent successfully",
        });
      } catch (err) {
        console.error("Send OTP error:", err);
        res.status(500).json({ status: false, message: "Server error occurred" });
      }
})

authRouter.post("/login", async(req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid email" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "incorrect password" });
  
  
      const profile = await Profile.findOne({ userId: user._id });
      if (!profile && user.role !== "admin") {
        return res.status(400).json({
          status: false,
          message: "Profile not found. Please complete your profile or register with another mail.",
        });
      } 
      const payload =  {id: user._id  };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });


   let roleMessage= "";
   switch (user.role) {
    case "driver":
        roleMessage=`Welcome ${user.firstName},your login is successful as a Driver, you have full access to your driver account`
        break;
     case "client":
        roleMessage=`Welcome ${user.firstName}, you have full access to your passenger account`
        break;
     case "admin":
        roleMessage=`Welcome ${user.email}, you have full access to your admin account, control all activities`
        break;
       
    default:
        break;
   }

      return res.status(200).json({
        status: true,
        message: `successfully logged in. ${roleMessage}`,
        token,
        role: user.role
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Server error" });
    }
})

authRouter.get("/adminDashboard", verifyToken, isAdmin, async(req, res) => {
    const userId = req.user?.id || req.user?._id

    if (!userId) {
        console.log("No user ID provided in request");
        return res.status(401).json({
          status: false,
          message: "Unauthorized: No user ID provided",
        });
      }
    
      try {
      
        const user = await User.findOne({ _id: userId });
        if (!user) {
          console.log("User not found for ID:", userId);
          return res.status(404).json({
            status: false,
            message: "Not authorized: User not found",
          });
        }

        return res.status(200).json({
            status: true,
            data: user,
          });
        } catch (error) {
          console.error("Dashboard error:", error);
          return res.status(500).json({
            status: false,
            message: "An error occurred",
            error: error.message, 
          });
        }

})

authRouter.get("/dashboard", verifyToken, async(req, res) => {
    const userId = req.user?.id || req.user?._id; 

    if (!userId) {
      console.log("No user ID provided in request");
      return res.status(401).json({
        status: false,
        message: "Unauthorized: No user ID provided",
      });
    }
  
    try {
    
      const user = await User.findOne({ _id: userId });
      if (!user) {
        console.log("User not found for ID:", userId);
        return res.status(404).json({
          status: false,
          message: "Not authorized: User not found",
        });
      }
  
  
  
      const profile = await Profile.findOne({ userId: user._id }).populate(
        "userId",
        "firstName lastName email role"
      );
      if (!profile) {
        console.log("Profile not found for user ID:", user._id);
        return res.status(400).json({
          status: false,
          message: "Profile not found. Please complete your profile or register with another email.",
        });
      }
  
  
  
      return res.status(200).json({
        status: true,
         profile,
      });
    } catch (error) {
   
      return res.status(500).json({
        status: false,
        message: "An error occurred",
        error: error.message, 
      });
    }
})


authRouter.put('/verify-user/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('User not found for ID:', req.params.id);
      return res.status(404).json({
        status: false,
        message: 'User not found',
        data: null,
      });
    }

    // Check if the user is a driver or client
    if (!['driver', 'client'].includes(user.role)) {
      console.log('Invalid role for verification:', user.role);
      return res.status(400).json({
        status: false,
        message: 'User is neither a driver nor a client',
        data: null,
      });
    }

    // Check if already verified
    if (user.verificationStatus === 'verified') {
      console.log('User already verified:', user.email);
      return res.status(400).json({
        status: false,
        message: 'User is already verified',
        data: null,
      });
    }

    user.verificationStatus = 'verified';
    await user.save();

    const profile = await Profile.findOne({ userId: req.params.id }).populate('userId');
    if (!profile) {
      console.log('Profile not found for user ID:', req.params.id);
      return res.status(404).json({
        status: false,
        message: 'Profile not found for this user',
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      message: 'User verified successfully',
      data: profile, // Includes populated userId with updated verificationStatus
    });
  } catch (error) {
    console.error('Error verifying user:', error.stack);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message,
    });
  }
});

authRouter.get("/users", async(req, res) =>{
    try {
        const profiles = await Profile.find()
        .populate({
          path: "userId",
          match: { role: { $in: ["client", "driver"] }, isBlacklisted: { $ne: true } },
          select: "firstName lastName  email role verificationStatus uniqueNumber",
        })
        .select("slug profilePicture  gender LGA state comments")
        .lean();
  
    const filteredProfiles = profiles.filter((profile) => profile.userId);

    const profilesWithStats = await Promise.all(
        filteredProfiles.map(async(profile) => {
            const userId = profile.userId?._id;

            const rides = await Ride.find({ driverId: userId}).select("status calculatedPrice").lean()

            const completedRideCount = rides.filter(
            (ride) => ride.status === "completed"
            ).length
            const cancelledRideCount = rides.filter(
            (ride) => ride.status === "cancalled"
            ).length;

            const totalIncome =  rides.filter((ride) => ride.status === "completed").reduce((sum, ride) => sum + (ride.calculatedPrice || 0), 0);
            const platFormFee = totalIncome * 0.1;
            const incomeAfterFee = totalIncome -platFormFee


            return {
                ...profile,
                commentCount: profile.comments ? profile.comments.length : 0,
                completedRideCount,
                cancelledRideCount,
                totalIncome,
                platFormFee,
                incomeAfterFee,
            }


        })
    )

    res.status(200).json({
        status:true,
        message: profilesWithStats.length > 0 ? "users retrieved successfully" : "No users found",
        data: profilesWithStats,
    })
    } catch (error) {
        console.error("Error fetching erranders:", error.stack);
        res.status(500).json({
          status: false,
          message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
      }
})





authRouter.get('/allusers', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $nin: ['admin'] } })
      .select('firstName lastName email role');
    
    console.log('Fetched non-admin users:', users.length);

    return res.status(200).json({
      status: true,
      message: 'All non-admin users',
      data: users,
    });
  } catch (error) {
    console.error('Error in /allusers:', error.message);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

authRouter.get("/drivers", async (req, res) => {
  try {
    const { state, lga } = req.query; 

 
    const profileQuery = {
      ...(state && { 'location.state': state }),
      ...(lga && { 'location.lga': lga }),
    };

    // Fetch profiles with populated userId, filtering for role: "driver"
    const profiles = await Profile.find(profileQuery)
      .populate({
        path: "userId",
        match: { role: "driver", isBlacklisted: { $ne: true } }, // Only drivers, not blacklisted
        select: "firstName lastName email role verificationStatus uniqueNumber",
      })
      .select("userEmail profilePicture carPicture carDetails gender location phoneNumber comments clicks available rating rideCount slug")
      .lean();

    // Filter out profiles where userId didn't match (i.e., not a driver or blacklisted)
    const filteredProfiles = profiles.filter((profile) => profile.userId);

    // Enrich profiles with additional stats (comments, clicks, rides)
    const driversWithStats = await Promise.all(
      filteredProfiles.map(async (profile) => {
        const userId = profile.userId?._id;
        const slug = profile.slug;

        // Fetch rides for the driver
        const rides = await Ride.find({ driverId: userId })
          .select("status calculatedPrice")
          .lean();

        // Calculate completed and rejected (canceled) rides
        const completedRideCount = rides.filter(
          (ride) => ride.status === "completed"
        ).length;
        const rejectedRideCount = rides.filter(
          (ride) => ride.status === "cancelled" // Fixed the typo "cancalled" to "cancelled"
        ).length;

        // Calculate financial stats
        const totalIncome = rides
          .filter((ride) => ride.status === "completed")
          .reduce((sum, ride) => sum + (ride.calculatedPrice || 0), 0);
        const platFormFee = totalIncome * 0.1;
        const incomeAfterFee = totalIncome - platFormFee;

        // Fetch clicks (adjust based on your actual Click model/schema)
        let clickCount = profile.clicks || 0; // Use clicks field from Profile schema
        /* If clicks are stored in a separate collection, uncomment and adjust:
        try {
          const clicksResponse = await Click.find({ slug }).lean();
          clickCount = clicksResponse.length || 0;
        } catch (clickError) {
          console.error(`Error fetching clicks for slug ${slug}:`, clickError.stack);
        }
        */

        return {
          ...profile,
          commentCount: profile.comments ? profile.comments.length : 0,
          clickCount, // Number of clicks
          completedRideCount, // Number of completed rides
          rejectedRideCount, // Number of rejected (canceled) rides
          totalIncome, // Total income from completed rides
          platFormFee, // Platform fee (10% of total income)
          incomeAfterFee, // Income after deducting platform fee
        };
      })
    );

    // Send response
    res.status(200).json({
      status: true,
      message: driversWithStats.length > 0 ? "Drivers retrieved successfully" : "No drivers found",
      data: driversWithStats,
    });
  } catch (error) {
    console.error("Error fetching drivers:", error.stack);
    res.status(500).json({
      status: false,
      message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
    });
  }
});


authRouter.get("/clients", async (req, res) => {
  try {
    const { state, lga } = req.query; 

 
    const profileQuery = {
      ...(state && { 'location.state': state }),
      ...(lga && { 'location.lga': lga }),
    };


    const profiles = await Profile.find(profileQuery)
      .populate({
        path: "userId",
        match: { role: "client", isBlacklisted: { $ne: true } }, 
        select: "firstName lastName email role verificationStatus uniqueNumber",
      })
      .select("userEmail profilePicture carPicture carDetails gender location phoneNumber comments clicks available rating rideCount slug")
      .lean();

    // Filter out profiles where userId didn't match (i.e., not a driver or blacklisted)
    const filteredProfiles = profiles.filter((profile) => profile.userId);

    // Enrich profiles with additional stats (comments, clicks, rides)
    const driversWithStats = await Promise.all(
      filteredProfiles.map(async (profile) => {
        const userId = profile.userId?._id;
        const slug = profile.slug;

        // Fetch rides for the driver
        const rides = await Ride.find({ driverId: userId })
          .select("status calculatedPrice")
          .lean();

        // Calculate completed and rejected (canceled) rides
        const completedRideCount = rides.filter(
          (ride) => ride.status === "completed"
        ).length;
        const rejectedRideCount = rides.filter(
          (ride) => ride.status === "cancelled" // Fixed the typo "cancalled" to "cancelled"
        ).length;

        // Calculate financial stats
        const totalIncome = rides
          .filter((ride) => ride.status === "completed")
          .reduce((sum, ride) => sum + (ride.calculatedPrice || 0), 0);
        const platFormFee = totalIncome * 0.1;
        const incomeAfterFee = totalIncome - platFormFee;

        // Fetch clicks (adjust based on your actual Click model/schema)
        let clickCount = profile.clicks || 0; // Use clicks field from Profile schema
        /* If clicks are stored in a separate collection, uncomment and adjust:
        try {
          const clicksResponse = await Click.find({ slug }).lean();
          clickCount = clicksResponse.length || 0;
        } catch (clickError) {
          console.error(`Error fetching clicks for slug ${slug}:`, clickError.stack);
        }
        */

        return {
          ...profile,
          commentCount: profile.comments ? profile.comments.length : 0,
          clickCount, // Number of clicks
          completedRideCount, // Number of completed rides
          rejectedRideCount, // Number of rejected (canceled) rides
          totalIncome, // Total income from completed rides
          platFormFee, // Platform fee (10% of total income)
          incomeAfterFee, // Income after deducting platform fee
        };
      })
    );

    // Send response
    res.status(200).json({
      status: true,
      message: driversWithStats.length > 0 ? "clients retrieved successfully" : "No client found",
      data: driversWithStats,
      profiles
    });
  } catch (error) {
    console.error("Error fetching drivers:", error.stack);
    res.status(500).json({
      status: false,
      message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
    });
  }
});



authRouter.put('/blacklist-user/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.isValidObjectId(req.params.id)) {
      console.log('Invalid user ID:', req.params.id);
      return res.status(400).json({
        status: false,
        message: 'Invalid user ID',
        data: { userId: req.params.id },
      });
    }

    // Find the user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('User not found for ID:', req.params.id);
      return res.status(404).json({
        status: false,
        message: 'User not found',
        data: { userId: req.params.id },
      });
    }

    // Check if the user is a driver or client
    if (!['driver', 'client'].includes(user.role)) {
      console.log('Invalid role for blacklisting:', user.role);
      return res.status(400).json({
        status: false,
        message: 'User is neither a driver nor a client',
        data: { userId: req.params.id },
      });
    }

    // Find the corresponding Profile document
    const profile = await Profile.findOne({ userId: req.params.id });
    if (!profile) {
      console.log('Profile not found for user ID:', req.params.id);
      return res.status(404).json({
        status: false,
        message: 'Profile not found for this user',
        data: { userId: req.params.id },
      });
    }

    // Check if already blacklisted
    if (profile.isBlacklisted) {
      console.log('User already blacklisted:', user.email);
      return res.status(400).json({
        status: false,
        message: 'User is already blacklisted',
        data: { userId: req.params.id },
      });
    }

    // Update blacklist status
    profile.isBlacklisted = true;
    await profile.save();
    console.log('User blacklisted:', user.email);

    // Populate userId for the response
    await profile.populate('userId');

    res.status(200).json({
      status: true,
      message: 'User blacklisted successfully',
      data: profile,
    });
  } catch (error) {
    console.error('Error blacklisting user:', error.stack);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message,
    });
  }
});
  // Unblacklist an errander
authRouter.put("/unblacklist-errander/:id", verifyToken, isAdmin, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
          data: null,
        });
      }
  
      if (user.role !== "driver" || user.role !== "client") {
        return res.status(400).json({
          status: false,
          message: "User is neither  an driver not a client",
          data: null,
        });
      }
  
      const profile = await Profile.findOne({ userId: req.params.id });
      if (!profile) {
        return res.status(404).json({
          status: false,
          message: "Profile not found for this user",
          data: null,
        });
      }
  
      if (!profile.isBlacklisted) {
        return res.status(400).json({
          status: false,
          message: "user is not blacklisted",
          data: null,
        });
      }
  
      profile.isBlacklisted = false;
      await profile.save();
  
      const updatedProfile = await Profile.findOne({ userId: req.params.id }).populate('userId');
  
      res.status(200).json({
        status: true,
        message: "Errander unblacklisted successfully",
        data: updatedProfile,
      });
    } catch (error) {
      console.error("Error unblacklisting errander:", error.stack);
      res.status(500).json({
        status: false,
        message: "Server error",
        error: process.env.NODE_ENV === "production" ? null : error.message,
      });
    }
  });
  
authRouter.put("/verify-errander/:id", verifyToken, isAdmin, async(req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if(!user){
      console.log("user not found")
      return res.status(404).json({
        status: false,
        message: "user not found",
        data: null
      })
    }

    if(user.role !== "driver" || user.role !== "client"){
      return res.status(400).json({
        status: false,
        message: "user is neither a driver nor a client",
        data: null
      })
    }

    if(user.verificationStatus === "verified"){
      return res.status(400).json({
        status: false,
        message: "user is already verified",
        data: null
      })
    }
    
    user.verificationStatus = "verified";
    await user.save()

    const profile = await Profile.findOne({userId: req.params.id}).populate('userId')
    if (!profile) {
      return res.status(404).json({
        status: false,
        message: "Profile not found for this user",
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      message: "Errander verified successfully",
      data: profile, 
    });
  } catch (error) {
    console.error("Error verifying errander:", error.stack);
    res.status(500).json({
      status: false,
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? null : error.message,
    });
  }
})





authRouter.post('/save-location', async (req, res) => {
  const { latitude, longitude, userId } = req.body;

  try {

      const user = await User.findOneAndUpdate(
          { userId },
          { 
              location: { 
                  latitude, 
                  longitude, 
                  lastUpdated: new Date() 
              } 
          },
          { upsert: true, new: true } 
      );
      res.status(200).json({ message: 'Location saved', user });
  } catch (error) {
      
      res.status(500).json({ message: 'Server error' });
  }
});


authRouter.get('/get-location/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
      const user = await User.findOne({ userId });
      if (!user || !user.location) {
          return res.status(404).json({ message: 'Location not found' });
      }
      res.status(200).json(user.location);
  } catch (error) {
  
      res.status(500).json({ message: 'Server error' });
  }
});




export default authRouter