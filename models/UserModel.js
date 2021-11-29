const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    emailToken: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
    },
    profileImage: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        postId: String,
        postImage: String,
      },
    ],
    savedPosts: [
      {
        postId: String,
        postImage: String,
      },
    ],
    followers: [
      {
        type: String,
      },
    ],
    following: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
