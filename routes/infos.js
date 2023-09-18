const {validationInfos, Infos} = require('../models/infos.js');
const auth = require('../middleware/auth.js');
const express = require('express');
const router = express.Router();

router.post('/add_infos/', async(req, res) => {
    let {error} = await validationInfos(req.body);
    if(error) throw Error(error.details[0].message);
    console.log('...adding infos new infos')
    // const post = await Infos.findOne({owner: req.userId});
    // if(post) throw Error('something went wrong');
    console.log(req.body)
    let userInfos = new Infos({...req.body});
    // let userInfos = new Infos({...req.body, owner: 123});
    await userInfos.save();
    return res.status(201).json({userinfos: userInfos})
});

router.put('/edit_infos/', auth, async(req, res) => {
    let {name, gmail, hobbies, links} = req.body;
    let update_infos = await Infos.findOneAndUpdate({_id: req.query.id},{
        $set: {
            name,
            gmail,
            hobbies,
            links
        }
    },{new: true});
    await update_infos.save();
    return res.status(202).send(update_infos);
});

router.delete('/delete_infos/', auth, async(req, res) => {
    await Infos.deleteOne({_id: req.query.id});
    return res.status(204).send('successfully deleted'); 
});

router.get('/search_infos/', async(req, res) => {
    const {name} = req.query;
    if(!name) return res.status(400).send('Write a name or email');
    let rgx = new RegExp(`${name}`, 'i'); 
    let result = await Infos.find({$or: [{name: rgx}, {gmail: rgx}]});
    return res.status(200).send(result);
   
});

router.get('/all_infos/', async(req, res) => { 
    let infos = await Infos.find();
    return res.json({infos: infos}).status(200); 
});

module.exports = router;
