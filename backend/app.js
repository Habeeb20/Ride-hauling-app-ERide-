
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import multer from "multer";
import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Conversation from "./model/ride/conversationSchema.js";
 import profileRoute from "./routes/authRoutes/profileRoute.js";
import authRouter from "./routes/authRoutes/authRoute.js";
import rideRoute from "./routes/rideRoutes/rideRoute.js";
import connectDb from "./db.js";

import deliveryRoute from "./routes/deliveryRoutes/deliveryRoute.js";
import OwnAcarRoute from "./routes/ownAcar/ownACarRoute.js";
import ScheduleRoute from "./routes/rideRoutes/scheduleRoute.js";
import rentalRoutes from "./routes/vehicle/rentalRoutes.js";
import reportRouter from "./routes/reportRoute/reportRoute.js";


import { redisClient, connectRedis } from "./redis.js";


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Socket.IO authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Missing authentication token"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    socket.user = decoded; // { id: userId, role: "client"/"driver" }
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`Socket.IO connection established: ${socket.id}, User: ${socket.user.id}`);
  socket.join(socket.user.id);

  socket.on("new ride", async (rideData) => {
    try {
      console.log(`New ride request by ${socket.user.id}:`, rideData);
      io.emit("new ride request", { rideId: rideData.id || "temp", ...rideData });
    } catch (error) {
      console.error("Error handling new ride:", error);
    }
  });

  socket.on("accept ride", (rideId) => {
    try {
      console.log(`Ride ${rideId} accepted by driver ${socket.user.id}`);
      socket.join(rideId);
      io.to(rideId).emit("driver response", { rideId, driverId: socket.user.id });
    } catch (error) {
      console.error("Error handling ride accept:", error);
    }
  });

  socket.on("send message", async ({ rideId, text }) => {
    try {
      const userId = socket.user.id;
      const conversation = await Conversation.findOne({ rideId });
      if (conversation && [conversation.clientId.toString(), conversation.driverId?.toString()].includes(userId)) {
        const message = { senderId: userId, text, timestamp: new Date() };
        conversation.messages.push(message);
        await conversation.save();
        // Cache message in Redis (expires in 24 hours)
        await redisClient.rPush(`chat:${rideId}`, JSON.stringify(message));
        await redisClient.expire(`chat:${rideId}`, 24 * 60 * 60);
        io.to(rideId).emit("new message", message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.user.id} disconnected`);
    io.emit("userDisconnected", `User ${socket.user.id} has left`);
  });
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(morgan("dev"));

// Multer for file uploads
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// Make io and redisClient accessible in routes
app.set("io", io);
app.set("redis", redisClient);

// Routes
app.get("/", (req, res) => {
  res.send("Eride is listening on port....");
});
app.use("/api/auth", authRouter);
app.use("/api/profile", upload.any(), profileRoute);
app.use("/api/rides", rideRoute);
app.use("/api/delivery", deliveryRoute);
app.use("/api/ownacar", OwnAcarRoute);
app.use("/api/schedule", ScheduleRoute);
app.use("/api/rental", rentalRoutes);
app.use("/api/reports", reportRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ status: false, message: "Internal server error" });
});

// Start server
const port = process.env.PORT || 8080;
Promise.all([connectDb(), connectRedis()])
  .then(() => {
    // Redis adapter for Socket.IO
    const pubClient = redisClient;
    const subClient = pubClient.duplicate();
    return subClient.connect().then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      server.listen(port, "0.0.0.0", () => {
        console.log(`Server running on port ${port}`);
      });
    });
  })
  .catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
  });

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});