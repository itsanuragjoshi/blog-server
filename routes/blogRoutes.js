// Import Express framework
import express from "express";

// Import blog controllers
import {
  readPostsByUser,
  readPostByUser,
  createPostByAuthor,
  readPostsByAuthor,
  updatePostByAuthor,
  deletePostByAuthor,
} from "../controllers/blogController.js";

// Import middleware for requiring authentication
import requireAuth from "../middleware/requireAuth.js";

// Create an Express router
const router = express.Router();

// Authenticated routes (authentication required)
router.get("/dashboard", requireAuth, readPostsByAuthor); // Route for fetching all posts by an author
router.post("/", requireAuth, createPostByAuthor); // Route for creating a new post by an author
router.put("/:id", requireAuth, updatePostByAuthor); // Route for updating a post by ID by an author
router.delete("/:id", requireAuth, deletePostByAuthor); // Route for deleting a post by ID by an author

// Public routes (no authentication required)
router.get("/:id", readPostByUser); // Route for reading a single post by ID by all users
router.get("/", readPostsByUser); // Route for reading all posts by all users

// Export router
export default router;
