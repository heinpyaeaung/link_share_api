const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Token = require('./token.js')
let userSchema = new mongoose.Schema({
    username: {
        type: String,
        minLength: 4,
        maxLength: 30,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetToken: {
        type: String,
        required: false
    }
});

userSchema.methods.generateJwtToken = function(){
    return jwt.sign({email: this.email, id: this._id}, process.env.SECRET_KEY, {expiresIn: '1h'});
}

userSchema.methods.generateResetPasswordToken = function(){
    return crypto.randomBytes(16).toString('hex');
}

userSchema.methods.generateVertificationToken = function(){
    let payload = {
        user_id: this._id,
        token: crypto.randomBytes(16).toString('hex')
    }
    return new Token(payload);
}

function userValidation(user_infos){
    let Schema = new Joi.object({
        username: Joi.string().min(4).max(30).required(),
        email: Joi.string().email(),
        password: Joi.string().min(6).max(10).required()
    });
    return Schema.validate(user_infos);
}

const User = mongoose.model('User', userSchema);

module.exports.userValidation = userValidation;
module.exports.User = User;