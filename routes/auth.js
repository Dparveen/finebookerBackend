const router = require('express').Router();
const User = require('../models/User');
const createHash = require('hash-generator');
// var passwordGenerator = require('generate-otp')
var axios = require('axios');

function isNumber(x) {
	return parseFloat(x) == x
  };


const findUser = async (username, password, status) => {return (await User.find({username: username, hash: password, user_status:status}))};
const findUserWithUserNamePass = async (username, password) => {return (await User.find({username: username, hash: password}))};
//   const maincat = async () => {return (await MainCat.find().select('mainCat status'))};
const updateUser = async (username, token,sts) => {return (await User.findOneAndUpdate({username: username},{hash_new: token,isOnline:sts },{new : true}))};
const updateUserPass = async (username, pass) => {return (await User.findOneAndUpdate({username: username},{hash: pass},{new : true}))};
//   async function singlePost(id){
// 	  return (await Post.findById(id)
// 		  .populate('uid',"f_name l_name")
// 		  .populate('like',"f_name l_name")
// 		  .populate('dislike',"f_name l_name")
// 		  .populate('metoo',"f_name l_name")
// 		  .populate({path: 'report',populate: { path: 'uid', select:'f_name l_name '}, select:'r_text r_proof'})
// 		  .populate('share',"f_name l_name")
// 		  .populate({path: 'comment',populate: { path: 'uid', select:'f_name l_name '}, select:'c_text'})
// 		  .populate({path: 'review', populate: { path: 'uid', select:'f_name l_name '}, select:'r_text'})
// 		  )};

router.post("/adminLogin", async (req, res) => {
	
	if(req.body.username.length >= 8 && req.body.pass.length >= 8){
		const user =await findUser(req.body.username, req.body.pass,"Y");
		console.log(user)
		if(user.length > 0){
			if(user[0].userType === 7){
				return res.status(200).json({status:false, msg:req.body.username+" is not admin"});
			}else{
			let hashLength = 32;
			let token = createHash(hashLength);
			let update = updateUser(user[0].username, token, 'Y');
			let auth ={
				token:token,
			}
			return res.status(200).json({status:true, msg:user[0].username+" is valid user", auth:auth, data: user[0]});
		}
			
		}else{
			return res.status(200).json({status:false, msg:req.body.username+" is not valid user or not active"});
		}
		
}else{
	return res.status(200).json({status: false, msg:"Enter valid login information"});
}
});

router.post("/loginUser", async (req, res) => {
	
	if(req.body.username.length >= 8 && req.body.pass.length >= 8){
		const user =await findUser(req.body.username, req.body.pass,"Y");
		console.log(user)
		if(user.length > 0){
			if(user[0].userType !== 7){
				return res.status(200).json({status:false, msg:req.body.username+" is not valid user or not active"});
			}else{
			let hashLength = 32;
			let token = createHash(hashLength);
			let update = updateUser(user[0].username, token, 'Y');
			let auth ={
				token:token,
			}
			return res.status(200).json({status:true, msg:user[0].username+" is valid user", auth:auth, data: user[0]});
		}
			
		}else{
			return res.status(200).json({status:false, msg:req.body.username+" is not valid user or not active"});
		}
		
}else{
	return res.status(200).json({status: false, msg:"Enter valid login information"});
}
});

// async function isUser(data) {
//    return (await User.findOneAndUpdate(data, {status:true})
// 		  .populate("spam","f_name l_name")
// 		  .populate("scam","f_name l_name")
// 		  .populate("spamComment","spam_text")
// 		  .populate("uid","f_name l_name")
// 		  );
// };

router.post("/otpVerify", async (req, res) => {
			return res.status(403).json({status: false, msg:"Mismatch"});
});



router.post('/changePassword', async(req, res)=>{

	let update = await updateUserPass(req.body.userName, req.body.pass);
	console.log(update, req.body);
	res.send({status: true, msg: 'Password changed successfully'})

})

router.post('/changePass/:id', async(req, res)=>{
	let find = await findUserWithUserNamePass(req.body.userName, req.body.oPass);
	if(find.length > 0){
    let update = await updateUserPass(req.body.userName, req.body.nPass);	
	res.send({status: true, msg: 'Password changed successfully'})
    }else{
	res.send({status: true, msg: 'Auth Failed'})
    }

})


module.exports = router