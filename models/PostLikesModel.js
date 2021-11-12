const mongoose = require("mongoose");

const PostsLikeSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
    },
    likes: [
      {
        username: {
          type: String,
          required: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PostLikes", PostsLikeSchema);
