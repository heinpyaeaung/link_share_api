const jwt = require('jsonwebtoken');
module.exports = function auth(req, res, next){
    if(!req.cookies.secretkey) return res.json({error: 'Not valid'}).status(401);
    let decode = jwt.verify(req.cookies.secretkey, process.env.SECRET_KEY);
    if(!decode) return res.json({error: 'Invalid user'}).status(401);
    req.userId = decode.id;
    next();
}