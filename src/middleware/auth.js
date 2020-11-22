const jwt = require('jsonwebtoken');
const process = require('process');

exports.isAuth = (req, res, next) => {
    if(!req.headers.authorization) {
        return res.status(401).json({status: 401, error: "You don't have authorization"})
    }
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.USER_TOKEN_KEY, (err, decodedToken) => {
        if(err) {
            return res.status(401).json({error: "Invalid or expired token. You don't have authorization"})
        }
        req.user = decodedToken;
        next();
    })
}