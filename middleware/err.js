module.exports = function (err, req, res, next){
    res.json({error: err.message});
    console.log(err.message);
}