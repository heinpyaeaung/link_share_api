const mongoose = require('mongoose');
const Joi = require('joi');

const infosSchema = new mongoose.Schema({
    profile: String,
    name: String,
    // gmail: String,
    // hobbies: [String],
    links: [{header: String, icon: String, link: String}],
    createdAt:{
        type: Date,
        default: new Date()
    },
    owner: mongoose.Types.ObjectId
})
const Infos = mongoose.model('Infos', infosSchema);

function validationInfos(infos){
    let Schema = Joi.object({
        profile: Joi.string(),
        name: Joi.string().max(20),
        // gmail: Joi.string().email(),
        // hobbies: Joi.array().items(Joi.string()),
        links: Joi.array().items({header: Joi.string(), icon: Joi.string(), link: Joi.string()})
    })
    return Schema.validate(infos);
}

module.exports.validationInfos = validationInfos;
module.exports.Infos = Infos;