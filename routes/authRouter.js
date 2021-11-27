const router = require("express").Router();
const User = require("../models/UserModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const token = process.env.SECRET_KEY || "welovejavascript";
// const sendgridTransporter = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
// 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

var transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: "kasularamesh@outlook.com",
    pass: "Captain@7337",
  },
});

// register
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const RandomToken = crypto.randomBytes(64).toString("hex");

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
      emailToken: RandomToken,
      isEmailVerified: false,
    });

    var mailOptions = {
      from: "kasularamesh@outlook.com",
      to: req.body.email,
      subject: "signup successfull!!",
      html: `<div>
      <h1>welcome to instagram.</h1> 
      <a href=http://localhost:3000/${RandomToken}?username=${req.body.username} style={{
        background-color: #4CAF50; 
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
      }} target="_blank">click the linkto verify</a> </div>`,
    };

    await newUser.save().then((user) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    });

    return res.status(200).json({
      msg: "user created",
      status: 200,
      // data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Try Later",
      text: error.message,
      status: 500,
    });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    const validate = await bcrypt.compare(req.body.password, user.password);
    !user && res.status(404).json({ msg: "wrong Credentials" });

    if (!validate) {
      return res.status(404).json({ msg: "wrong Credentials" });
    }
    const { password, emailToken, ...others } = user._doc;
    if (user && validate) {
      const usertoken = jwt.sign({ _id: others._id }, token);

      return res.status(200).json({
        msg: "Login Succesful",
        data: others,
        token: usertoken,
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
