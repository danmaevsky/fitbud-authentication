const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");

router.post("/createAccount", async (req, res) => {
    //regex exp
    const passcheck = new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!.@#\$%&\*\.])[A-Za-z0-9!.@#\$%&\*\.]{8,}$/);
    const emailcheck = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    //checking if inputted password meets criteria
    const email = req.body.email;

    //password check
    if (!passcheck.test(req.body.saltedHashedPass)) {
        return res
            .status(400)
            .json({
                message:
                    "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number and one special character!",
            });
    }

    //valid email check
    if (!emailcheck.test(req.body.email)) {
        return res.status(400).json({ message: "This is not a valid email address!" });
    }

    //checking if an account already exists
    if ((await User.findOne({ email })) != undefined) {
        return res.status(400).json({ message: "Account is already associated with that email!" });
    }

    //using bcrypt to generate a password
    const userHash = await bcrypt.hash(req.body.saltedHashedPass, 12).catch((err) => console.error(err.message));

    //creating a new user under input arguments
    const user = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        saltedHashedPass: userHash,
        profilePicture: req.body.profilePicture,
        birthdate: req.body.birthdate,
        sex: req.body.sex,
        heightCM: req.body.heightCM,
        startingWeightKg: req.body.startingWeightKg,
        currentWeightKg: req.body.currentWeightKg,
        percentBodyFat: req.body.percentBodyFat,
        goals: req.body.goals,
        preferences: req.body.preferences,
    });

    //try catch relating to creating a new user object
    try {
        const newuser = await user.save();
        res.status(201).json({ message: "Account Created!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post("/login", async (req, res) => {
    //getting the email to identify the user and password login request
    const email = req.body.email;
    const plaintextpassword = req.body.password;

    //finding the user using the passed email
    const isUser = await User.findOne({ email });

    //if the email isn't in our database we return an error
    if (!isUser) return res.status(400).json({ message: "User not exist" });

    //password check
    bcrypt.compare(plaintextpassword, isUser.saltedHashedPass, (err, data) => {
        //if error than throw error
        if (err) res.status(500).json({ message: err.message });

        //if both match than you can do anything
        if (data) {
            res.status(200).json({ message: "Login success!" });
        }
        //if it fails the password is incorrect
        else {
            res.status(401).json({ message: "Invalid credentials!" });
        }
    });
});

router.put("/changePassword", async (req, res) => {
    //collect password body
    const currPassword = req.body.currPassword;
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;
    const email = req.body.email;

    //regex pasword criteria
    const passcheck = new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!.@#\$%&\*\.])[A-Za-z0-9!.@#\$%&\*\.]{8,}$/);

    //if any of the fields are empty
    if (!currPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: "Missing fields!" });
    }

    //if the password does not match the confirm password
    if (newPassword != confirmNewPassword) {
        return res.status(400).json({ message: "Password fields do not match!" });
    }

    if (!passcheck.test(newPassword)) {
        console.log(passcheck.test(newPassword));
        return res
            .status(400)
            .json({
                message:
                    "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number and one special character!",
            });
    }

    //plaintext password passes checks, time to hash new password and store it
    //now check if the current password is correct and change the password
    const userAccount = await User.findOne({ email });

    bcrypt.compare(currPassword, userAccount.saltedHashedPass, (err, isMatch) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        if (isMatch) {
            bcrypt.hash(newPassword, 12, (err, hash) => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
                userAccount.saltedHashedPass = hash;
                userAccount.save();
                return res.status(201).json({ message: "no content" });
            });
        }
    });
});
module.exports = router;
