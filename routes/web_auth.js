const router = require('express').Router();
const User = require('../models/User');
const createHash = require('hash-generator');
const otpGenerator = require('otp-generator');
var axios = require('axios');

function isNumber(x) {
	return parseFloat(x) == x
  };

///register api 
router.post("/register", async (req, res) => {
	if( isNumber(req.body.phone) === true && req.body.phone.length ===10 ){
	try {
		//////otp genrater
		console.log(isNumber(req.body.phone));
		const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
		let hashLength = 32;
		const token = createHash(hashLength);
		const user = await User.updateOne({ mobile_no: req.body.phone }, { $set: { token: token, otp: otp } }, { upsert: true });
		return res.status(200).json({"status":1,otp:otp,token:token});
	} catch (err) {
		return res.status(500).json(err);
	}
}else{
	return res.status(500).json({status: false, msg:"Please Enter a valid mobile number"});
}
});



router.post("/otpVerify", async (req, res) => {
	if(!req.body.token || !req.body.otp){
		return res.status(500).json('Ooophs Communication error');
	}else{
		if( req.body.otp.length === 6 && isNumber(req.body.otp) === true ){
	try{
	// res.status(500).json('error in communication, wrong parameter sent');
	let user = await User.findOneAndUpdate({token: req.body.token, otp:req.body.otp }, 
    {status:true}, null, function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
		if(!docs) {return res.status(500).json({status: false, msg:"OTP not matched"});}else{
        console.log("Original Doc : ",docs); return res.status(200).json({status: true, msg:"Account Verified", id: docs._id});
		}
    }
});
	}
		catch(err){console.warn(err);}
		}else{
			return res.status(403).json({status: false, msg:"Mismatch"});
		}
	}
});


module.exports = router