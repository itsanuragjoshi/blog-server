// Import Express framework
import express from "express";

// Import image upload controllers
import {
  imageByFileDraft,
  imageByFilePublished,
} from "../controllers/uploadImageController.js";

// Import middleware for requiring authentication
import requireAuth from "../middleware/requireAuth.js";

// Create an Express router
const router = express.Router();

// Authenticated routes (authentication required)
router.post("/imageByFile", requireAuth, imageByFileDraft); // Route for uploading an image file in draft mode
router.post("/imageByFilePublished", requireAuth, imageByFilePublished); // Route for uploading an image file in published mode

// Export router
export default router;
