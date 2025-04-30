import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDb from "./db.js";
import dotenv from "dotenv";
import morgan from "morgan";
import multer from "multer";
import http from "http";
import { Server } from "socket.io";
import authRouter from "./routes/authRoutes/authRoute.js";
import profileRoute from "./routes/authRoutes/profileRoute.js";
import rideRoute from "./routes/rideRoutes/rideRoute.js";
import deliveryRoute from "./routes/deliveryRoutes/deliveryRoute.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
connectDb().then(() => {
  console.log("MongoDB connected successfully");
}).catch((err) => {
  console.error("MongoDB connection error:", err.message);
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(morgan("dev"));

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
app.use("/api/profile",  profileRoute); 

// Routes
app.get("/", (req, res) => {
  res.send("Eride is listening on port....");
});

app.use("/api/auth", authRouter);
app.use("api/delivery", deliveryRoute)
app.use("/api/ride", rideRoute(io)); 


app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});