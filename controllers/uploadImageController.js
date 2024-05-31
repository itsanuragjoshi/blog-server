// Import dependencies
import path from "node:path"; // Node.js module for path operations
import crypto from "node:crypto"; // Node.js module for cryptographic functions
import fs from "node:fs/promises"; // Node.js module for file system operations
import multer from "multer"; // Middleware for handling file uploads
import sharp from "sharp"; // Node.js image processing library

// Define paths for storing draft and published images
const DRAFT_IMAGE_PATH = "public/uploads/images/draft";
const PUBLISHED_IMAGE_PATH = "public/uploads/images";

// Configure storage for draft images
const draftStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, DRAFT_IMAGE_PATH);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename based on MD5 hash, timestamp, and original filename
    const hash = crypto
      .createHash("md5")
      .update(file.originalname)
      .digest("hex")
      .slice(0, 13);
    const filename = `${hash}${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

// Filter function to allow only specific file types
const fileFilter = function (req, file, cb) {
  let extension = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = [".jpeg", ".jpg", ".png", ".webp"];

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Allowed file types are: .jpeg, .jpg, .png, .webp"
      ),
      false
    );
  }
};

// Create multer instances for draft and published uploads
const draftUpload = multer({
  storage: draftStorage,
  fileFilter: fileFilter,
});

// Controller function for handling draft image uploads
const imageByFileDraft = async (req, res) => {
  try {
    // Use multer to handle the single file upload
    draftUpload.single("image")(req, res, async (error) => {
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Generate a unique hash for the filename
      const hash = crypto
        .createHash("md5")
        .update(req.file.originalname)
        .digest("hex")
        .slice(0, 13);
      const compressedImagePath = `${DRAFT_IMAGE_PATH}/${hash}${Date.now()}.webp`;

      // Process the uploaded image using sharp: convert to WebP format
      await sharp(req.file.path).toFormat("webp").toFile(compressedImagePath);

      // Remove the original image file
      await fs.unlink(req.file.path);

      // Send a success response with the compressed image URL
      await res.json({
        message: "Image uploaded to draft successfully",
        success: 1,
        file: {
          url: `${process.env.SERVER_URI}/${compressedImagePath}`,
        },
      });
    });
  } catch (error) {
    // Handle errors and send an error response
    res.status(400).json({ error: error.message });
  }
};

// Controller function for moving an image from draft to published
const imageByFilePublished = async (req, res) => {
  try {
    const { imageURL } = req.body;
    const imageName = imageURL.substring(imageURL.lastIndexOf("/") + 1);

    // Define paths for draft and published images
    const draftImagePath = `${DRAFT_IMAGE_PATH}/${imageName}`;
    const publishedImagePath = `${PUBLISHED_IMAGE_PATH}/${imageName}`;

    // Move the image file from draft to published folder
    await fs.rename(draftImagePath, publishedImagePath);

    // Send a success response with the published image URL
    res.json({
      message: "Image moved to published folder successfully",
      success: 1,
      file: {
        url: `${process.env.SERVER_URI}/${publishedImagePath}`,
      },
    });
  } catch (error) {
    // Handle errors and send an error response
    res.status(400).json({ error: error.message });
  }
};

// Export functions for use in routes
export { imageByFileDraft, imageByFilePublished };
