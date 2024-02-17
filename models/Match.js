/////models is use for define schema model
const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    CompetitionID:{ type: Number, required: true,},
    EventTypeID:{ type: Number, required: true},
    eventId:{ type: Number, required: true, unique:true},
    eventName:{type: String, required: true},
    eventCountry:{type: String,},
    timeZone:{type: String,},
    openDate:{type: String, required: true},
    marketCount:{type: Number,},
    scoreboard_id:{type: String},
    selection:{type: String},
    liability:{type:Number, default: 0, required: true},
    undeclared_market:{type: Number,},
    status:{ type: Number,default: 1},
	marketId:{type: String },
	marketName: {type:String},
   	marketStartTime: {type:String},
    totalMatched: {type: String},
    runners: {type:Array , default:[]},
	lastUpdate:{type: Number, default: Date.now()},
}, { timestamps: true })

module.exports = mongoose.model("tbl_match", MatchSchema);