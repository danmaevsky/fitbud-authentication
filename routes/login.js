const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require("../models/userScheme")
const jwt = require('jsonwebtoken')



router.post('/login', async (req,res) => {
    //getting the email to identify the user and password login request
    const email = req.body.email
    const plaintextpassword = req.body.password

    //finding the user using the passed email
    const isUser = await User.findOne({ email })

    //if the email isn't in our database we return an error
    if(!isUser) return res.status(400).json({ message: "User not exist" })

    //password check
    bcrypt.compare(plaintextpassword, isUser.saltedHashedPass, (err, data) => {
        //if error than throw error
        if (err) res.status(500).json({message: err.message})

        //if both match than you can do anything
        if (data) {
           const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "10m"})
           const refreshToken = jwt.sign(email, )
            res.status(200).json({ accessToken:accessToken, message: "Login Successful!" })
        } 
        //if it fails the password is incorrect
        else {
            res.status(401).json({ message: "Invalid credentials!" })
        }

    })

})


module.exports = router

