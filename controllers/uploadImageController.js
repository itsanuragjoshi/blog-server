// Import dependencies
import multer from "multer"; // Middleware for handling file uploads
import crypto from "node:crypto"; // Node.js module for cryptographic functions
import sharp from "sharp"; // Node.js image processing library
import path from "node:path"; // Node.js module for path operations
import firebaseStorage from '../firebase.js'; // Import Firebase storage bucket
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage" // Firebase Storage functions

// Multer file filter function to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpeg", ".jpg", ".png", ".webp"];

  // Check file extension
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return cb(new Error('Invalid file type. Allowed file types are: .jpeg, .jpg, .png, .webp'));
  }
  // Pass file
  cb(null, true);
};

// Setting up multer as a middleware to handle uploads with memory storage
const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
});

// Controller function for handling draft image uploads
const imageByFileDraft = async (req, res) => {
  try {
    // Use multer to handle single file upload
    imageUpload.single("image")(req, res, async (error) => {
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Generate a unique hash for filename
      const hash = crypto
        .createHash("md5")
        .update(req.file.originalname)
        .digest("hex")
        .slice(0, 13);

      // Create a unique filename with .webp extension
      const imageName = `${hash}${Date.now()}.webp`;

      // Process uploaded image using sharp to convert it to WebP format
      const processedImageBuffer = await sharp(req.file.buffer).toFormat("webp").toBuffer();

      // Create a reference to Firebase storage for new image
      const draftImageRef = ref(firebaseStorage, `files/uploads/images/draft/${imageName}`);

      // Set metadata for uploaded image
      const metadata = {
        contentType: 'image/webp', // Ensure content type matches processed image format
      };

      // Upload processed image buffer to Firebase storage
      const snapshot = await uploadBytes(draftImageRef, processedImageBuffer, metadata);

      // Get download URL for uploaded image
      const draftImageUrl = await getDownloadURL(snapshot.ref);

      // Send a success response with URL of uploaded image
      await res.json({
        message: "Image saved to draft successfully",
        success: 1,
        file: {
          url: `${draftImageUrl}`,
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

    // Decode image URL to handle any encoded characters, then split to remove query parameters
    const imagePath = decodeURIComponent(imageURL).split("?")[0];

    // Extract image name from URL path
    const imageName = imagePath.substring(imagePath.lastIndexOf("/") + 1);

    // Create references for draft and published images in Firebase Storage
    const draftImageRef = ref(firebaseStorage, `files/uploads/images/draft/${imageName}`);
    const publishedImageRef = ref(firebaseStorage, `files/uploads/images/${imageName}`);

    // Get download URL of draft image
    const draftImageUrl = await getDownloadURL(draftImageRef);

    // Fetch image data from draft URL
    const response = await fetch(draftImageUrl);
    const imageData = await response.arrayBuffer();

    // Upload image data to published folder in Firebase Storage
    await uploadBytes(publishedImageRef, new Uint8Array(imageData), {
      contentType: 'image/webp', // Ensure content type is correct
    });

    // Delete image from draft folder
    await deleteObject(draftImageRef);

    // Get download URL of published image
    const publishedImageUrl = await getDownloadURL(publishedImageRef);

    // Send a success response with published image URL
    await res.json({
      message: "Image published successfully",
      success: 1,
      file: {
        url: `${publishedImageUrl}`,
      },
    });
  } catch (error) {
    // Handle errors and send an error response
    res.status(400).json({ error: error.message });
  }
};

// Export functions for use in routes
export { imageByFileDraft, imageByFilePublished };
