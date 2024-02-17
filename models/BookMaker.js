/////models is use for define schema model
const mongoose = require('mongoose');

const BookMakerSchema = new mongoose.Schema({
	ComponentId:{type:Number, required:true},
    marketId:{ type: Number, required: true,},
    mname:{ type: String,},
    remark:{type: String},
	remark1:{type: String},
    min:{typ:Number},
    max:{typ:Number},
    sid:{typ:Number},
    nat:{typ:String},
    b1:{typ:Number},
    bs1:{typ:Number},
    l1:{typ:Number},
    ls1:{typ:Number},
    s:{typ:String},
    sr:{typ:Number},
    gtype:{typ:String},
    utime:{typ:Number},
    b2:{typ:Number},
    bs2:{typ:Number},
    b3:{typ:Number},
    bs3:{typ:Number},
    l2:{typ:Number},
    ls2:{typ:Number},
    l3:{typ:Number},
    ls3:{typ:Number},
    b1s:{typ:Boolean},
    b2s:{typ:Boolean},
    b3s:{typ:Boolean},
    l1s:{typ:Boolean},
    l2s:{typ:Boolean},
    l3s:{typ:Boolean},
    status:{ type: Number,default: 1},
	lastUpdate:{type: Number, default: Date.now()}
}, { timestamps: true })

module.exports = mongoose.model("tbl_bookmaker", BookMakerSchema);