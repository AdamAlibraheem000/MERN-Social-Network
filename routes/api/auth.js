const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require("express-validator/check");
const config = require('config');
const auth = require('../../middleware/auth');

const User = require('../../models/User');


router.get('/', auth, async (req,res) => {
    try {
        // Get user data minus password
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});


// Get token for user
router.post('/', [
    check('email', 'Email Required').isEmail(),
    check('password', "password required").exists()
],

async (req,res) => {
    const errors = validationResult(req);

    // if errors due occur
    if(!errors.isEmpty()){
        // 400. Bad Request
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    try{
        // Check if user exists by email

        let user = await User.findOne({email})

        // If user does not exist
        if(!user){
           return res.status(400).json({errors: [{message: "Invalid login credentials"}]}); 
        }

        // Check if plain text & encrypted passwords match
        const match = await bcrypt.compare(password, user.password);

        // If passwords do not match...
        if(!match){
            return res.status(400).json({errors: [{message: "Invalid login credentials"}]}); 
         }

    // Return jsonwebtoken
    const payload = {
        user:{
            id: user.id
        }
    }

    jsonwebtoken.sign(payload, 
    config.get('jwtToken'),
    {expiresIn: 360000},  //change to 3600 in production
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