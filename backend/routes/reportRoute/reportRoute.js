import express from "express"
import Report from "../../model/Report/reportSchema.js";
import Auth from "../../model/auth/authSchema.js";
import Profile from "../../model/auth/profileSchema.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { report } from "process";
import { isAdmin } from "../authRoutes/authRoute.js";


const reportRouter= express.Router()


reportRouter.post("/createreport", verifyToken, async(req, res) => {
    try {
        const { driver, offence, observation, gradeOfOffence } = req.body;
    
        // Verify client role
        if (req.user.role !== "client") {
          return res.status(403).json({
            status: false,
            message: "Only clients can create reports",
          });
        }
    
        // Validate input
        if (!driver || !offence || !gradeOfOffence) {
          return res.status(400).json({
            status: false,
            message: "Driver, offence, and gradeOfOffence are required",
          });
        }


    
        // Verify driver exists
        const driverProfile = await Profile.findById(driver);
        if (!driverProfile) {
          return res.status(404).json({
            status: false,
            message: "Driver not found",
          });
        }
    
        // Create report
        const report = new Report({
          client: req.user._id,
          driver,
    
          offence,
          observation,
          gradeOfOffence,
        });
    
        await report.save();
    
        res.status(201).json({
          status: true,
          message: "Report created successfully",
          data: report,
        });
      } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({
          status: false,
          message: error.message || "Failed to create report",
        });
      }
})

// Driver: View their reports
reportRouter.get("/getmyReports", verifyToken, async(req, res) => {
    try {
        // Verify driver role
        if (req.user.role !== "driver") {
          return res.status(403).json({
            status: false,
            message: "Only drivers can view their reports",
          });
        }
    
        // Find driver profile linked to user
        const driverProfile = await Profile.findOne({ userId: req.user._id });
        if (!driverProfile) {
          return res.status(404).json({
            status: false,
            message: "Driver profile not found",
          });
        }
    
        // Get reports, populating client details
        const reports = await Report.find({ driver: driverProfile._id })
          .populate("client", "email firstName lastName")
          .sort({ date: -1 });
    
        res.status(200).json({
          status: true,
          message: "Reports retrieved successfully",
          data: reports,
        });
      } catch (error) {
        console.error("Error fetching driver reports:", error);
        res.status(500).json({
          status: false,
          message: error.message || "Failed to fetch reports",
        });
      }
})


reportRouter.get("/getallreports", verifyToken, isAdmin, async(req, res) => {
    try {
        // Get all reports, populating client and driver details
        const reports = await Report.find()
          .populate("client", "email firstName lastName") // Adjust fields as needed
          .populate("driver", "userId.firstName, userId.lastName, userId.uniqueNumber userEmail, profilePicture") 
    
          .sort({ date: -1 });
    
        res.status(200).json({
          status: true,
          message: "All reports retrieved successfully",
          data: reports,
        });
      } catch (error) {
        console.error("Error fetching all reports:", error);
        res.status(500).json({
          status: false,
          message: error.message || "Failed to fetch reports",
        });
      }
})


export default reportRouter