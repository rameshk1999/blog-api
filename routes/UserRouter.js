const router = require("express").Router();
const User = require("../models/UserModel.js");
const Post = require("../models/PostModel.js");
const bcrypt = require("bcrypt");

// update
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updateUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      res.status(200).json(updateUser);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json({
      msg: "You are not authorized",
    });
  }
});

// delete
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      try {
        await Post.deleteMany({ username: user.username });
        await User.findByIdAndDelete(req.params.id);

        return res.status(200).json({
          msg: "Account Deleted",
        });
      } catch (error) {
        res.status(500).json(error);
      }
    } catch (error) {
      res.status(404).json({
        msg: "User not found",
      });
    }
  } else {
    return res.status(401).json({
      msg: "You are not authorized",
    });
  }
});

// get user
router.get("/:id", async (req, res) => {
  if (req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const { password, ...others } = user._doc;
      return res.status(200).json(others);
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
});

module.exports = router;
