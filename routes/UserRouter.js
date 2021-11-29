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
        const { password, emailToken, isEmailVerified, ...others } = user._doc;
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
      !user && res.status(404).json({ msg: "Not found" });
      //if (user) {
      const { password, ...others } = user._doc;
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

// verify email
router.get("/verify/:id", async (req, res, next) => {
  const RandomToken = req.params.id;
  const username = req.query.username;

  const isUser = await User.findOne({ username: username });
  try {
    !isUser &&
      res.status(404).json({
        msg: "Invalid Credentials",
        status: 404,
      });
    const { username, emailToken, password, ...others } = isUser._doc;

    isUser &&
      RandomToken === emailToken &&
      User.findByIdAndUpdate(
        { _id: others._id },
        { $set: { isEmailVerified: true } }
      )
        .then(() => {
          return res.status(200).json({
            msg: "Email verified!",
            status: 200,
          });
        })
        .catch((error) => {
          res.status(500).json({
            status: 500,
            msg: error.message,
          });
          next();
        });
  } catch (error) {
    res.status(500).json({
      status: 500,
      msg: error.message,
    });
    next();
  }
});

router.put("/follow", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { followers: req.body.funId },
      },
      { new: true }
    );

    const newUser = await User.findByIdAndUpdate(
      req.body.funId,
      {
        $push: {
          following: req.body.followId,
        },
      },
      {
        new: true,
      }
    );

    user &&
      res.status(200).json({
        msg: "Following",
        status: 200,
      });

    !user &&
      res.staus(422).json({
        msg: "Not authorized",
        status: 422,
      });

    user &&
      newUser &&
      res.status(200).json({
        msg: "Following",
        status: 200,
      });

    !newUser &&
      res.staus(422).json({
        msg: "Not authorized",
        status: 422,
      });
  } catch (error) {
    res.status(500).json({
      msg: "Try Later!",
      status: 500,
    });
  }
});

router.put("/unfollow", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.unfollowId,
      {
        $pull: { followers: req.body.funId },
      },
      { new: true }
    );

    const newUser = await User.findByIdAndUpdate(
      req.body.funId,
      {
        $pull: {
          following: req.body.unfollowId,
        },
      },
      {
        new: true,
      }
    );

    user &&
      res.status(200).json({
        msg: "Following",
        status: 200,
      });

    !user &&
      res.staus(422).json({
        msg: "Not authorized",
        status: 422,
      });

    user &&
      newUser &&
      res.status(200).json({
        msg: "Following",
        status: 200,
      });

    !newUser &&
      res.staus(422).json({
        msg: "Not authorized",
        status: 422,
      });
  } catch (error) {
    res.status(500).json({
      msg: "Try Later!",
      status: 500,
    });
  }
});

// get all users
router.get("/allusers", async (req, res, next) => {
  try {
    const result = await User.find({});
    console.log("result", result);
  } catch (error) {
    res.status(500).json({
      msg: "Try later",
      name: error.message,
    });
  }
});

module.exports = router;
