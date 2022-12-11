const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const {check, validationResult} = require("express-validator/check");
const config = require('config');

const User = require("../../models/User");


router.post('/', [
    check('name', "Name Required").not().isEmpty(),
    check('email', 'Email Required').isEmail(),
],

async (req,res) => {
    const errors = validationResult(req);

    // if errors due occur
    if(!errors.isEmpty()){
        // 400. Bad Request
        return res.status(400).json({errors: errors.array()});
    }

    const { name, email, password} = req.body;

    try{
        // Check if user exists by email

        let user = await User.findOne({email})

        // If user exists
        if(user){
           return res.status(400).json({errors: [{message: "User already exixts"}]}); 
        }

        user = new User({
            name,
            email,
            password
        })

    // Encrypt password

    const salt = await bcrypt.genSalt(10);

    // hash password
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();


    // Return jsonwebtoken


    const payload = {
        user:{
            id: user.id
        }
    }

    jsonwebtoken.sign(payload, 
    config.get('jwtToken'),
    {expiresIn: 360000}, //change to 3600 in production
    (error, token) => {
        if(error) throw error;
        res.json({token});
    });

    }catch(e){
        console.error(e.message);
        res.send(500).send('Server Error');
    }
    

    
});


module.exports = router;