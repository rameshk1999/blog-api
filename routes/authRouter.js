const router = require("express").Router();
const User = require("../models/UserModel.js");
const bcrypt = require("bcrypt");

// register
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userUsername = await User.findOne({ username: req.body.username });

    if (userUsername) {
      return res.status(404).json({ msg: "Username already taken!" });
    }

    const userEmail = await User.findOne({ email: req.body.email });
    if (userEmail) {
      return res.status(404).json({ msg: "Email already exists" });
    }

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const userData = await newUser.save();
    return res.status(200).json({
      msg: "user created",
      status: 200,
      // data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Try Later",
      text: error,
      status: 500,
    });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(404).json({ msg: "wrong Credentials" });

    const validate = await bcrypt.compare(req.body.password, user.password);
    if (!validate) {
      return res.status(404).json({ msg: "wrong Credentials" });
    }

    const { password, ...others } = user._doc;
    if (user && validate) {
      return res.status(200).json({
        msg: "Login Succesful",
        data: others,
      });
    }
  } catch (error) {
    res.status(500).json({
      msg: "Try Later",
      status: 500,
    });
  }
});

module.exports = router;
