require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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
        if (err instanceof jwt.TokenExpiredError) {
          res
            .status(401)
            .send({ message: "Authentication failed. Access token expired." });
        }
        res
          .status(401)
          .send({ message: "Authentication failed. Bad credentials." });
      }
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.put("/:userId/:token", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).send({ message: "User does not exist" });
    } else {
      const resetSecret = FORGOT_PASSWORD_SECRET + user.saltedHashedPass;
      try {
        const verifyLink = jwt.verify(req.params.token, resetSecret);
      } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
          res
            .status(401)
            .send({ message: "Authentication failed. Access token expired." });
        }
        res
          .status(401)
          .send({ message: "Authentication failed. Bad credentials." });
      }
      const newPassword = req.body.newPassword;
      const confirmNewPassword = req.body.confirmNewPassword;

      const passcheck = new RegExp(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!.@#\$%&\*\.])[A-Za-z0-9!.@#\$%&\*\.]{8,}$/
      );

      if (!newPassword || !confirmNewPassword) {
        res.status(400).send({ message: "Missing fields!" });
      }
      if (newPassword != confirmNewPassword) {
        res.status(400).send({ message: "Password fields do not match!" });
      }

      if (!passcheck.test(newPassword)) {
        console.log(passcheck.test(newPassword));
        return res.status(400).send({
          message:
            "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number and one special character!",
        });
      }
      bcrypt.hash(newPassword, 12, (err, hash) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        user.saltedHashedPass = hash;
        user.save();
        console.log("Password changed successfully");
        return res.status(201).send({ message: "No Content" });
      });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
