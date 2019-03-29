let mongoose = require('mongoose');

let users = new mongoose.Schema({
    username: {type: String, require: true, unique : true},
    password: {type: String, require : true, unique: true},
    email : {type : String, require : true, unique: true},
    sessionId: {type: String, default: null},
    lastLogin: {type: Date, default: Date.now}
});

module.exports = mongoose.model('usersdatas',users);