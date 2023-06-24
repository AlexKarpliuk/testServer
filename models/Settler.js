const mongoose = require('mongoose')
const {Schema, model} = mongoose;



const SettlerSchema = new Schema({
	firstname: {type: String, require: true},
	lastname: {type: String,require: true},
},{
	timestamps: true
});

const SettlerModel = model('Settler', SettlerSchema)

module.exports = SettlerModel;
