const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');


// Get current user profile
router.get('/me', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name']);

        // Check if profile exists
        if(!profile){
            return res.status(400).json({message: "No profile exists"});
        }

        res.json(profile);


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});


// Create/Update user profile
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', "Skills required").not().isEmpty()
]],
 async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const{
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){
        // Turn list into an array. Map through array & remove whitespace
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({user: req.user.id});

        // If profile exists, update
        if(profile){
            profile = await Profile.findByIdAndUpdate(
            {user: req.user.id}, 
            {$set: profileFields}, 
            {new: true});

            return res.json(profile);
        }

        // If profile does not exist, Create new profile
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

   



})


module.exports = router;