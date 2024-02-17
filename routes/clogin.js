const router = require('express').Router();
const createHash = require('hash-generator');
const otpGenerator = require('otp-generator');
var axios = require('axios');

function isNumber(x) {
	return parseFloat(x) == x
  };

///register api 
router.post("/login", async (req, res) => {
	if(req.session.token){
		res.redirect('/dashboard')
	}
	if(!req.body.username || !req.body.password){
		let result
		res.redirect('/dashboard')
	}else{
		
	}
});

module.exports = router