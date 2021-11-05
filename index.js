const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const multer = require("multer");
dotenv.config();

// routers
const authRouter = require("./routes/authRouter.js");
const userRouter = require("./routes/UserRouter.js");
const postRouter = require("./routes/PostRouter.js");
const categoryRouter = require("./routes/CategoriesRouter.js");

// app
const app = express();
const port = process.env.PORT || 5000;
const Db_url =
  "mongodb+srv://ramesh:ramesh@cluster0.h8ctf.mongodb.net/social-media-blog?retryWrites=true&w=majority";

// middleware
app.use(express.json());

// Db connect
mongoose
  .connect(process.env.DBURL)
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
  });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, images);
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
// post image
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json({
    msg: "File has been uploaded.",
    status: 200,
  });
});

// routess
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/categories", categoryRouter);

app.listen(port, () => {
  console.log("api running", +port);
});
