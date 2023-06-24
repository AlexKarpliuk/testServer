const mongoose = require('mongoose')
const {Schema, model} = mongoose;



const AdminSchema = new Schema({
	login: {type: String, require: true},
	password: {type: String,require: true},
},{
	timestamps: true
});

const AdminModel = model('Admin', AdminSchema)

module.exports = AdminModel;