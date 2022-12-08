const express = require('express');
const router = express.Router();
const {check, validationResult} = require("express-validator/check");


router.post('/', [
    check('name', "Name Required").not().isEmpty(),
    check('email', 'Email Required').isEmail(),
],

(req,res) => {
    const errors = validationResult(req);

    // if errors due occur
    if(!errors.isEmpty()){
        // 400. Bad Request
        return res.status(400).json({errors: errors.array()});
    }
    res.send("User post route")
});


module.exports = router;