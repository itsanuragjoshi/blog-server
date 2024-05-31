import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    postAuthorId: {
      type: String,
      required: true,
    },

    postTitle: {
      type: String,
      required: true,
    },

    postContent: {
      type: Object,
      required: true,
    },

    postPreviewImage: {
      type: String,
      required: true,
    },

    postPreviewTitle: {
      type: String,
      required: true,
    },

    postPreviewDescription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
