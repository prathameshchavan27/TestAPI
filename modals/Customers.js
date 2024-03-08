const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    userId:{
        type:Number,
    },
    name:{
        type:String,
        require: true
    },
    address:{
        type:String,
        require: true
    },
    phone:{
        type:Number,
        require: true
    }
},{timestamp:true});

module.exports = mongoose.model("Customers",customerSchema)
