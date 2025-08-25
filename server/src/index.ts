import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import urlRoutes from "./routes/urlRoutes";

dotenv.config();

const app = express();

app.use(cors({ origin: ["http://localhost:3000"], credentials: false }));
app.use(express.json());
app.use(morgan("dev"));

// API routes (mounted at root because frontend calls /shorten directly)
app.use("/", urlRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || ""; // ✅ changed here

if (!MONGO_URI) {
  console.error("❌ Missing MONGODB_URI in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Mongo connection error", err);
    process.exit(1);
  });
