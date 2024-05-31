// Import Express framework
import express from "express";

// Import dotenv package for environment variable configuration
import dotenv from "dotenv";

// Import mongoose package for MongoDB connection
import mongoose from "mongoose";

// Import routes for blog, authentication, and image upload
import blogRoutes from "./routes/blogRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import uploadImageRoutes from "./routes/uploadImageRoutes.js";

// Import CORS package for handling Cross-Origin Resource Sharing
import cors from "cors";

// Load environment variables from a .env file
dotenv.config();

// Create an instance of Express application
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: process.env.CLIENT_URI,
  methods: ["POST", "GET", "DELETE", "PUT"],
  credentials: true
}));


// Connect to MongoDB database
const connectDB = async () => {
  try {
    // Connect to MongoDB database
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("Success! You are connected to database");
  } catch (error) {
    console.error("Error! Unable to connect to database", error.message);
    // Respond to client with a generic error message
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

// Initiate database connection
connectDB();

// Set up a callback for when database connection is open
mongoose.connection.once("open", () => {
  // Start listening for requests when database connection is successful
  app.listen(process.env.PORT || 4000);
});

// Use JSON middleware to parse incoming JSON requests
app.use(express.json());

// Define routes for authentication, blog posts, and image uploads
app.use("/api/auth", authRoutes);
app.use("/api/posts", blogRoutes);
app.use("/api/uploadImage", uploadImageRoutes);

// Serve static files from 'public' directory under '/public' route
app.use("/public", express.static("public"));
