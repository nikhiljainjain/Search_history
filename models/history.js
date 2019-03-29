let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let histry = new mongoose.Schema({
    searches : [
       {
           query :  {type: String, require: true},
            time : {type: Date, default: Date.now}
       }
    ],
    userObjId: {type: Schema.Types.ObjectId, ref: 'usersdatas', require: true},
});

module.exports = mongoose.model('histry',histry);