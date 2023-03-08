const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require("../models/userScheme")




router.post('/', async (req, res) =>  {
    //regex exp
    const passcheck = new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!.@#\$%&\*\.])[A-Za-z0-9!.@#\$%&\*\.]{8,}$/)
    const emailcheck = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    //checking if inputted password meets criteria
    const email = req.body.email
    
    //password check
    if(!passcheck.test(req.body.saltedHashedPass)){
        return res.status(400).json({message: "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number and one special character!" })
    }
    
    //valid email check
    if(!emailcheck.test(req.body.email)) {
        return res.status(400).json({message: "This is not a valid email address!"})
    }
    
    //checking if an account already exists
    if(await User.findOne({ email }) != undefined) {
        return res.status(400).json({message: "Account is already associated with that email!"})
    }


    //using bcrypt to generate a password
    const userHash = await bcrypt.hash(req.body.saltedHashedPass, 12).catch(err => console.error(err.message)) 
     
    //creating a new user under input arguments
    const user = new User({
        email: req.body.email,
        saltedHashedPass: userHash,
    })

    //try catch relating to creating a new user object
    try{
        const newuser = await user.save()
        console.log(user['_id'])
        res.status(201).json({userId:user['_id'], message: "Account Created!"})
    }
    catch(err){
        res.status(400).json({message: err.message})
    }
})
module.exports = router

