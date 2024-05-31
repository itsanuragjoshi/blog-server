// Import models
import User from "../models/userModel.js";

// Import dependencies
import bcrypt from "bcrypt"; // Library for password hashing
import validator from "validator"; // Library for input validation
import jwt from "jsonwebtoken"; // Library for handling JSON Web Tokens (JWT)

// Function to create a JWT token with a specified expiration time
const createToken = async (_id) => {
  return jwt.sign({ _id }, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

// Controller function for user registration
const registerUser = async (req, res) => {
  try {
    // Destructure user data from request body
    const { userEmail, userPassword, userName } = req.body;

    // Regular expression for validating user names
    const userNameRegex = /^(?!\s)[a-zA-Z]+(?: [a-zA-Z]+)*$/;

    // Check if required fields are missing
    if (!userEmail || !userPassword || !userName) {
      return res.status(401).json({
        error:
          "Oops! Looks like you forgot something. All fields are required.",
      });
    }

    // Validate email format
    if (!validator.isEmail(userEmail)) {
      return res.status(401).json({
        error:
          "Oh no! This doesn't look like a valid email address. Please double-check.",
      });
    }

    // Validate password strength
    if (!validator.isStrongPassword(userPassword)) {
      return res.status(401).json({
        error:
          "Uh-oh! Your password needs to be stronger. userPassword must be at least 8 characters long and include at least 1 lowercase letter (a, z), 1 uppercase letter (A, Z), 1 digit (0-9), and 1 special character (!,%,@,# etc.).",
      });
    }

    // Check for duplicate email in database
    const duplicateEmail = await User.findOne({ userEmail });
    if (duplicateEmail) {
      return res.status(409).json({
        error: "Oops! This email already exists. Try another one to be unique!",
      });
    }

    // Validate full name using regex
    if (!userNameRegex.test(userName)) {
      return res.status(401).json({
        error:
          "Uh-oh! Your full name should only contain letters and spaces. Please check and try again.",
      });
    }

    // Generate a salt and hash password
    const saltRounds = 16;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    // Create a new user in database
    await User.create({
      userEmail,
      userPassword: hashedPassword,
      userName,
    });

    // Send a success response
    res.status(201).json({ userEmail, userName });
  } catch (error) {
    // Send an error response for other errors
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Controller function for user login
const loginUser = async (req, res) => {
  try {
    // Destructure user credentials from request body
    const { userEmail, userPassword } = req.body;

    // Check if required fields are missing
    if (!userEmail || !userPassword) {
      return res.status(401).json({
        error:
          "Oops! Looks like you forgot something. Both email and password are required.",
      });
    }

    // Validate email format
    if (!validator.isEmail(userEmail)) {
      return res.status(401).json({
        error:
          "Oh no! This doesn't look like a valid email address. Please double-check.",
      });
    }

    // Find user with provided email in database
    const registeredUser = await User.findOne({ userEmail });
    if (!registeredUser) {
      return res.status(401).json({
        error:
          "Oh no! It seems either your email or password is incorrect. Please check and try again.",
      });
    }

    // Compare provided password with hashed password in database
    const match = await bcrypt.compare(
      userPassword,
      registeredUser.userPassword
    );
    if (!match) {
      return res.status(401).json({
        error:
          "Oops! It seems your email and password are in a disagreement. Give it another shot!",
      });
    }

    // Create a JWT token for authenticated user
    const accessToken = await createToken(registeredUser._id);

    // Send a success response with user details and access token
    res.status(200).json({
      accessToken,
      userId: registeredUser._id,
      userName: registeredUser.userName,
      expiresIn: 1 * 24 * 60 * 60 * 1000, // Expiration time in milliseconds (1 day)
    });
  } catch (error) {
    // Send an error response for other errors
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Controller function for fetching user information
const fetchUser = async (req, res) => {
  try {
    // Extract author's ID from request parameters
    const authorId = req.params.id;
    
    // Find user by ID and send response
    const user = await User.findById(authorId).select("_id userName");

    // Handle case where user is not found
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Destructure _id and userName from user object
    const { _id, userName } = user;

    // Send response with userId instead of _id
    res.status(200).json({ userId: _id, userName });
  } catch (error) {
    // Send an error response for other errors
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Export functions for use in routes
export { registerUser, loginUser, fetchUser };
