// Import models
import Post from "../models/postModel.js";

// Controller function for reading posts by authenticated author
const readPostsByAuthor = async (req, res) => {
  try {
    // Get author's ID from authenticated user
    const authorId = req.user._id.toString();

    // Build a filter based on authorId
    const filter = { postAuthorId: authorId };

    // Find posts matching filter and send response
    const filteredPosts = await Post.find(filter).sort({
      createdAt: -1,
    });
    res.status(200).json(filteredPosts);
  } catch (error) {
    // Send an error response for other errors
    res.status(500).json({ error: "Error! Unable to fetch posts from server" });
  }
};

// Controller function for reading posts with optional search query
const readPostsByUser = async (req, res) => {
  try {
    // Extract search query from request query parameters
    const { q: searchQuery } = req.query;

    // Build a filter based on search query
    const filter = searchQuery
      ? {
          $or: [
            { postTitle: { $regex: searchQuery, $options: "i" } },
            { postContent: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    // Find posts matching filter and send response
    const filteredPosts = await Post.find(filter).sort({ createdAt: -1 });
    res.status(200).json(filteredPosts);
  } catch (error) {
    // Send an error response for other errors
    res.status(500).json({ error: "Error! Unable to fetch posts from server" });
  }
};

// Controller function for reading a specific post by ID
const readPostByUser = async (req, res) => {
  try {
    // Extract post ID from request parameters
    const postId = req.params.id;

    // Find post by ID and send response
    const post = await Post.findById(postId);

    // Handle case where post is not found
    if (!post) {
      res.status(404).json({ error: "Error! Unable to find post" });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    // Send an error response for other errors
    res.status(500).json({ error: "Error! Unable to fetch post from server" });
  }
};

// Controller function for creating a new post
const createPostByAuthor = async (req, res) => {
  try {
    // Get author's ID from authenticated user
    const authorId = req.user._id;

    // Create a new post with provided data and author's ID
    await Post.create({ ...req.body, postAuthorId: authorId });

    // Send a success response with created post
    res.status(201).json({ success: "Success! Your post has been published" });
  } catch (error) {
    // Send an error response for other errors
    res.status(500).json({ error: "Error! Unable to publish your post" });
  }
};

// Controller function for updating a specific post by ID by authenticated author
const updatePostByAuthor = async (req, res) => {
  try {
    // Extract post ID from request parameters
    const postId = req.params.id;

    // Update post by ID with provided data
    const updatedPost = await Post.findByIdAndUpdate(postId, req.body, {
      new: true,
    });

    // Handle case where post is not found
    if (!updatedPost) {
      res.status(404).json({ message: "Error! Unable to find your post" });
      return;
    }

    // Send a success response with updated post
    res.status(200).json({ success: "Success! Your post has been updated" });
  } catch (error) {
    // Send an error response for other errors
    res.status(500).json({ error: "Error! Unable to update your post" });
  }
};

// Controller function for deleting a specific post by ID by authenticated author
const deletePostByAuthor = async (req, res) => {
  try {
    // Extract post ID from request parameters
    const postId = req.params.id;

    // Delete post by ID
    const deletedPost = await Post.findByIdAndDelete(postId);

    // Handle case where post is not found
    if (!deletedPost) {
      res.status(404).json({ error: "Error! Unable to find your post" });
      return;
    }

    // Send a no-content response for successful deletion
    res.status(204).json({ success: "Success! Your post has been deleted" });
  } catch (error) {
    // Send an error response for other errors
    res.status(500).json({ error: "Error! Unable to delete your post" });
  }
};

// Export functions for use in routes
export {
  readPostsByUser,
  readPostByUser,
  readPostsByAuthor,
  createPostByAuthor,
  updatePostByAuthor,
  deletePostByAuthor,
};
