const router = require("express").Router();
const User = require("../models/UserModel.js");
const Post = require("../models/PostModel.js");
const Category = require("../models/CategoryModel.js");
const bcrypt = require("bcrypt");

// create category
router.post("/create", async (req, res) => {
  const newCat = await Category(req.body);

  try {
    const savedCat = await newCat.save();
    res.status(201).json({
      msg: "category created.",
      data: savedCat,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Try later",
      status: 500,
    });
  }
});

// get all category
router.get("/getall", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      msg: "Fechted",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Try Later",
      stauts: 500,
    });
  }
});
module.exports = router;
