const jsonwebtoken = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next){
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if token exists
    if(!token){
        return res.status(401).json({message: 'Token not found'});
    }

    // Verify token
    try{
        const decoded = jsonwebtoken.verify(token, config.get('jwtToken'));

        req.user = decoded.user;
        next();
    }catch(e){
        res.status(401).json({message: "Token invalid"});
    }
}