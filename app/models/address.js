var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var addressSchema = new Schema({
	address: String,
	privateKey: {type: String, required: true, unique: true},
});

var Address = mongoose.model('Address', addressSchema);

module.exports = Address;