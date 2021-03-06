const router = require("express").Router();
const User = require("../models/UserModel.js");
const Post = require("../models/PostModel.js");
const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel.js");

// create post
router.post("/create", async (req, res) => {
  const newPost = new Post(req.body);

  try {
    const savedPost = await newPost.save();
    res.status(201).json({
      msg: "Post Created",
      data: savedPost,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Unable to create, Try later",
      status: 500,
    });
  }
});

// update post
router.put("/update/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.username === req.body.username) {
      try {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedPost);
      } catch (error) {
        res.status(500).json({
          msg: "Please try later",
        });
      }
    } else {
      res.status(401).json({
        msg: "Unauthorized!",
        status: 401,
      });
    }
  } catch (error) {
    res.status(500).json({
      msg: error.message,
      status: 500,
    });
  }
});

// like post
router.put("/like", async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.body.userId },
    },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({
        msg: err,
        status: 422,
      });
    } else {
      res.json(result);
    }
  });
});

// unlike post
router.put("/unlike", async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.body.userId },
    },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({
        msg: err,
        status: 422,
      });
    } else {
      res.json(result);
    }
  });
});

// comment post
router.put("/comment", async (req, res) => {
  // const user = await UserModel.findById(req.body.userId);
  // user && console.log("user", user);
  const comment = {
    text: req.body.text,
    postedBy: req.body.username,
    postById: req.body.userId,
    profile: req.body.profile,
  };

  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({
        msg: err.message,
        status: 422,
      });
    } else {
      res.json({
        msg: "Comment added",
        status: 201,
        data: result,
      });
    }
  });
});

// delete post
router.delete("/delete/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.username === req.body.username) {
      try {
        await post.delete();
        res.status(200).json({
          msg: "Post has been deleted.",
          status: 200,
        });
      } catch (error) {
        res.status(500).json({
          msg: "Please try later",
        });
      }
    } else {
      res.status(401).json({
        msg: "Unauthorized!",
        status: 401,
      });
    }
  } catch (error) {
    res.status(500).json({
      msg: error.message,
      status: 500,
    });
  }
});

// get post
router.get("/get/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json({
      data: post,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Try later",
    });
  }
});

router.get("/getall", async (req, res) => {
  console.log(req.query);
  const username = req.query.user;
  const categoryname = req.query.category;

  try {
    let posts;
    if (username) {
      posts = await Post.find({ username });
    } else if (categoryname) {
      posts = await Post.find({
        categories: {
          $in: [categoryname],
        },
      });
    } else {
      posts = await Post.find();
    }

    return res.status(200).json({
      data: posts,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Try later",
    });
  }
});

module.exports = router;
