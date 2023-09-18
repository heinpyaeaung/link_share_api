const express = require('express');
const router = express.Router();
const {User, userValidation} = require('../models/user.js');
const {Infos} = require('../models/infos.js');
const Token = require('../models/token.js');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const auth = require('../middleware/auth.js');

router.post('/login/', async(req, res) => {
    try{
        let {email, password} = req.body;
        
        console.log(req.body)
        let is_gmail_registered = await User.findOne({email});
        if(!is_gmail_registered) return res.json({error: 'This email is not registered'}).status(401);

        let check_pwd = await bcrypt.compare(password, is_gmail_registered.password);
        if(!check_pwd) return res.json({error: 'Wrong Password'}).status(401);
        if(!is_gmail_registered.isVerified) return res.json({error: 'Account is not verified'}).status(401);
        
        let jwtToken = is_gmail_registered.generateJwtToken();
        return res.status(202).cookie('secretkey', jwtToken, {httpOnly: false, secure: false}).json({message: 'login successfully'});
    }catch(err){
        return res.status(400).json({error: err.message});
    }
})

router.post('/register/', async(req, res) => {
    let {error} = await userValidation(req.body);
    if(error) return res.json({error: error.details[0].message});

    try{
        let {email, password} = req.body;
        let check_gmail_exist = await User.findOne({email});
        if(check_gmail_exist) return res.status(400).json({error: 'This email has been already registered'})
                    
        let saltRound = 10;
        let hasedPassword = await bcrypt.hash(password, saltRound);
        req.body.password = hasedPassword;
        let user = new User({...req.body});
        sendMail(user, req, res);
      
    }catch(err){
        return res.status(400).json({error: err.message});
    }
})

router.patch('/user/verify/:token/', async(req, res) => {
    try{
        let {token} = req.params;
        let result = await Token.findOne({token});
        if(!result) return res.status(400).send('Can not verify this account');
    
        let {user_id} = result;
        let user = await User.findByIdAndUpdate({_id: user_id}, {isVerified: true});
        if(!user) return res.status(400).send('This token does not relate any of link share accounts');
        await user.save();
        return res.status(201).send('Your account is successfully verified, please log in');
    }catch(err){
        return res.status(400).send(err.message)
    }
})

router.get('/recover_account/', async(req, res) => {
   try{
        let hasEmail = await User.findOne({gmail: req.query.gmail});
        if(!hasEmail) return res.status(401).send('This email has not found');

        let recoverResetToken = hasEmail.generateResetPasswordToken();
        hasEmail.resetToken = recoverResetToken;
        await hasEmail.save();
        // let emailForm = {
        //     to: hasEmail.gmail,
        //     from: process.env.FROM_EMAIL,
        //     subject: 'ACCOUNT RECOVER TOKEN',
        //     html: recoverResetToken
        // }   
        // await sgMail.send(emailForm);
        return res.status(200).send(`Recover Token has been sent to your email, Please check in`);
   }catch(err){
        return res.status(400).send(err.message)
   }
})

router.patch('/reset_pwd/', async(req, res) => {
    try{
        let {newPwd, resetToken} = req.body;
        let hasEmail = await User.findOne({resetToken});
        if(!hasEmail) return res.status(404).send(`can not change new password`);
    
        let saltRound = 10;
        let hasedPassword = await bcrypt.hash(newPwd, saltRound);
        hasEmail.password = hasedPassword;
        hasEmail.resetToken = ''
        await hasEmail.save();
    
        return res.send(200).send('password has been changed, please log in')
    }catch(err){
        return res.status(400).send(err.message)
    }
})

router.delete('/delete_account/', auth, async(req, res) => {
   try{
        await Infos.deleteMany({owner: req.userId});
        await User.findOneAndDelete(req.userId);
        return res.status(204).send(`successfully deleted`);
   }catch(err){
        return res.status(400).send(err.message);
   }
});

async function sendMail(user, req, res){
    let token = user.generateVertificationToken();

    let to = user.email
    let from = process.env.FROM_EMAIL
    let subject = 'SHARE LINK ACCOUNT VERTIFICATION ALERT'
    let link = `http://${req.headers.host}/api/user/verify/${token.token}`
    let html = `<strong>Hi ${user.username}, please click on the following link to verify your account
                <a href="${link}">Click Here</a> if you did not request this, please ignore this email</strong>`

    try{
        await token.save();
        await user.save();
        await sgMail.send({to,from,subject,html});
        res.status(200).json({message: 'Email has been sent to your email account, Please Verify'})
    }catch(err){
        return res.status(400).send(err.message);
    }   
    
}

module.exports = router;