import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import connectDb from "./db.js";
import dotenv from "dotenv";
import morgan from "morgan";
import multer from "multer";

import http from 'http';
import { Server } from 'socket.io';
import authRouter from "./routes/authRoutes/authRoute.js";
import profileRoute from "./routes/authRoutes/profileRoute.js";

dotenv.config();
connectDb();

const app = express();
const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*', 
//     methods: ['GET', 'POST'],
//   },
// });

app.set("timeout", 60000);



// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });


const port = process.env.PORT || 8080


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(multer().any());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, 
  }));

app.use(bodyParser.json());
app.use(morgan("dev"));


app.get("/", (req, res) => {
    res.send("Eride is listening on port....")
  })

app.use("/api/auth", authRouter )
app.use("/api/profile", profileRoute)
  


  
app.listen(port, () => {
    console.log(`Your app is listening on port ${port}`)
})








