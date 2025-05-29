import jwt from "jsonwebtoken";
import User from "../model/auth/authSchema.js";
import Profile from "../model/auth/profileSchema.js";
export const verifyToken =  async (req, res, next) => {

  const authHeader = req.headers.authorization || req.headers.Authorization;


  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Authorization header missing or malformed");
    return res.status(401).json({ message: "Authorization header missing or malformed" });
  }


  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("Token not provided in Authorization header");
    return res.status(401).json({ message: "Token not provided" });
  }

 
  try {
   
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('id role');
    
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({ status: false, message: 'User not found' });
    }

    req.user = { id: user._id.toString(), role: user.role };
    console.log('Verified user:', req.user); // Debug log
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
 
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    } else {
      return res.status(403).json({ message: "Token verification failed" });
    }
  }
};







export const isDriver = async (req, res, next) => {
  try {
    // Fetch user to check role
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role !== "driver") {
      return res.status(403).json({ error: "Access denied. Drivers only." });
    }

    // Fetch profile using user._id as userId
    const profile = await Profile.findOne({ userId: user._id.toString() });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found. Please create a profile." });
    }

    req.profile = profile; 
    req.userDocument = user; 
    next();
  } catch (error) {
    console.error("Error in isDriver middleware:", error);
    res.status(500).json({ error: "Server error" });
  }
};
























