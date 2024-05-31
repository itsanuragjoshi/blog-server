// Import Express framework
import express from "express";

// Import authentication controllers
import {
  loginUser,
  registerUser,
  fetchUser,
} from "../controllers/authController.js";

// Import middleware for requiring authentication
import requireAuth from "../middleware/requireAuth.js";

// Create an Express router
const router = express.Router();

// Public routes (no authentication required)
router.post("/login", loginUser); // Route for handling user login
router.get("/user/:id", fetchUser); // Route for fetching user information

// Authenticated routes (authentication required)
router.post("/register", requireAuth, registerUser); // Route for handling user registration

// Export router
export default router;
