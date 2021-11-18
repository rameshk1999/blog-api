const router = require("express").Router();
const User = require("../models/UserModel.js");
const Post = require("../models/PostModel.js");
const bcrypt = require("bcrypt");

// get user
router.get("/:id", async (req, res) => {
  if (req.params.id) {
    try {
      const user = await User.findById({ _id: req.params.id });
      // const validate = await bcrypt.compare(req.body.password, user.password);

      !user && res.status(404).json({ msg: "wrong Credentials" });

      // if (!validate) {
      //   return res.status(404).json({ msg: "wrong Credentials" });
      // }
      if (user) {
        const { password, username, ...others } = user._doc;
        return res.status(200).json({ status: 200, msg: others });
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
});

// get user data
router.get("/getuserdata/:id", async (req, res) => {
  if (req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      console.log(user ? "true" : "false");
      !user && res.status(404).json({ msg: "wrong Credentials" });
      //if (user) {
      const { username, password, ...others } = user._doc;
      user && res.status(200).json({ status: 200, data: others });
      // }
    } catch (error) {
      res.status(500).json({ status: 500, error: error.message });
    }
  } else {
    return res.json({
      status: 401,
      msg: "Unauthorized",
    });
  }
});

// add to liked post
router.put("/likedpost", async (req, res) => {
  const liked = {
    userId: req.body.userId,
    postId: req.body.postId,
    postImage: req.body.postImage,
  };
  console.log(req.body.userId);
  try {
    // const user = User.findByIdAndUpdate(req.body.userId);
    const user = User.findById(req.body.userId);
    console.log("user", user ? "true" : "false");
    user &&
      User.findByIdAndUpdate(
        req.body.userId,
        { $push: { likedPosts: liked } },
        { new: true }
      ).exec((err, result) => {
        if (err) {
          return res.status(422).json({
            msg: err,
            status: 422,
          });
        } else {
          return res.json(result);
        }
      });
  } catch (error) {
    return res.status(422).json({
      msg: error.message,
      status: 422,
    });
  }
  // const post = await User.findByIdAndUpdate(
  //   req.body.userId,
  //   {
  //     $push: { likedPosts: liked },
  //   },
  //   { new: true }
  // ).exec((err, result) => {
  //   if (err) {
  //     return res.status(422).json({
  //       msg: err,
  //       status: 422,
  //     });
  //   } else {
  //     return res.json(result);
  //   }
  // });
});

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
  console.log(
    req.body,
    req.params.id,
    typeof req.params.id,
    req.params.id === req.body.userId
  );

  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById({ _id: req.params.id });
      const validate = await bcrypt.compare(req.body.password, user.password);

      if (!user) {
        return res.status(404).json({ status: 404, msg: "wrong Credentials" });
      }

      if (!validate) {
        return res.status(404).json({ staus: 404, msg: "unauthorized" });
      }

      if (user && validate) {
        try {
          await Post.deleteMany({ username: user.username });
          await User.findByIdAndDelete(req.params.id);

          return res.status(200).json({
            status: 200,
            msg: "Account Deleted",
          });
        } catch (error) {
          res.status(500).json(error);
        }
      }
    } catch (error) {
      res.status(404).json({
        msg2: error.message,
        msg: "User not found",
      });
    }
  } else {
    res.status(401).json({
      msg: "You are not authorized",
    });
  }
});

module.exports = router;
