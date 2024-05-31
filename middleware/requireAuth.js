// Import models
import User from "../models/userModel.js";

// Import dependencies
import jwt from "jsonwebtoken"; // library for token verification

// Middleware to check for a valid Authorization token
const requireAuth = async (req, res, next) => {
  // Extract Authorization header from request
  const { authorization } = req.headers;
  // Check if Authorization header is present
  if (!authorization) {
    return res
      .status(401)
      .send("401 Unauthorized: Authorization token required for entry.");
  }

  // Extract token from Authorization header
  const token = authorization.split(" ")[1];
  try {
    // Verify JWT token using secret key
    const { _id } = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

    // Retrieve user information from database based on _id from token
    req.user = await User.findOne({ _id }).select("_id");

    // Call next middleware in chain
    next();
  } catch (error) {
    // Handle token verification errors
    return res
      .status(401)
      .send("401 Unauthorized: Invalid or expired Authorization token.");
  }
};

// Export middleware
export default requireAuth;
