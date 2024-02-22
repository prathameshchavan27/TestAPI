const mongoose = require('mongoose');

const recordSchema = mongoose.Schema({
    userId:{
        type:Number,
        require:true
    },
    rid:{
        type: Number,
        require:false
    },
    name:{
        type:String,
        require:true,
        max:50
    },
    date:{
        type: Date,
        require:true
    },
    distributed:{
        type:Number,
        require:true,
    },
    prevBal:{
        type:Number,
        require:true,
    },
    total:{
        type:Number,
        require:true,
    },
    collected:{
        type:Number,
        require:false,
    },
    balance:{
        type:Number,
        require:true,
    }
},{timestamps:true});

module.exports = mongoose.model("Record",recordSchema);