require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/userSchema");

const FORGOT_PASSWORD_SECRET = process.env.FORGOT_PASSWORD_SECRET;

router.post("/", async (req, res) => {
  email = req.body.email;
  console.log("hit post");

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(404).send({ message: "User does not exist" });
    } else {
      const resetSecret = FORGOT_PASSWORD_SECRET + user.saltedHashedPass;
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        resetSecret,
        { expiresIn: "15m" }
      );
      console.log(user);
      const resetLink = `http://localhost:${process.env.LISTEN_PORT}/forgotPassword/${user._id}/${token}`;
      res.status(200).send(resetLink);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.get("/:userId/:token", async (req, res) => {
  const userId = req.params.userId;
  const token = req.params.token;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send({ message: "User does not exist" });
    } else {
      const resetSecret = FORGOT_PASSWORD_SECRET + user.saltedHashedPass;
      try {
        const verifyLink = jwt.verify(token, resetSecret);
        res
          .status(200)
          .send({ message: "Token Verified. User may reset password" });
      } catch (err) {
        res
          .status(401)
          .send({ message: "Could not verify token. User Unauthorized" });
      }
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
