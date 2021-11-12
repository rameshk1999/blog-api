const PostLikesModel = require("../../models/PostLikesModel");
const PostModel = require("../../models/PostModel.js");

const router = require("express").Router();

// post like
router.post("/post", async (req, res) => {
  const newLike = await req.body.likes.filter((username) => username);
  const comment = newLike[0].username;
  const postId = await req.body.postId;
  // console.log(req.body, newLike[0].username);

  try {
    const existId = await PostModel.findById({ _id: req.body.postId });
    if (existId) {
      const result = await PostLikesModel.create({
        postId,
        username: comment,
        // postId,
      }).then((res) => {
        return res.status(201).json({
          msg: "Comment added.",
          data: result,
        });
        s;
      });
      console.log(result);
    } else {
      return res.status(404).json({
        status: 404,
        msg: "",
      });
    }
  } catch (error) {
    res.json({
      msg: error.message,
      status: 500,
    });
    console.log(error.message);
  }
});

module.exports = router;
