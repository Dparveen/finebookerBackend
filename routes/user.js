const router = require('express').Router();
const User = require('../models/User');
const createHash = require('hash-generator');
const Wallet = require('../models/Wallet');
const UserType = require('../models/UserType');
const DepositeRequest = require('../models/DepositeRequest');
const WithdrawalRequest = require('../models/WithdrwalRequest');


const findUserType = async () => { return (await UserType.find({ status: 1 })) };
const LiveUser = async () => { return (await User.find({ isOnline: 'Y' })) };
const findByParentID = async (pid) =>{ return (await User.find({parentid:pid}))};
const findUser = async (token) => { return (await User.find(token)) };
const findUserBytype = async (type) => { return (await User.find({userType:type})) };
const findAllUser = async () => { return (await User.find()) };
const findUsername = async (username) => { return (await User.find({ username: username })) };
const findTransaction = async (user) => { return (await Wallet.find({$or: [{ toUser: user },{ fromUser: user }]}).sort({ _id: -1 }))};

const CheckTid = async(tId)=>{return (await DepositeRequest.find({transectionId:tId}))}
const findDepositeByUsername = async(username)=>{return (await DepositeRequest.find({requestFrom:username}))}
const findDepositbyId = async(id)=>{return (await DepositeRequest.find({_id:id}))}
const findWithdrawalByUsername = async(username)=>{return (await WithdrawalRequest.find({requestFrom:username}))}
const findWithdrawalbyId = async(id)=>{return (await WithdrawalRequest.find({_id:id}))}
const findWithdrawal = async () => { return (await WithdrawalRequest.find().sort({createdAt: -1}))};
const updateWithdrawalByID = async (id,comment, sts) => { return (await WithdrawalRequest.findOneAndUpdate({_id:id},{comment:comment, status:sts}))};
const updateDepositeByID = async (id,comment, sts) => { return (await DepositeRequest.findOneAndUpdate({_id:id},{comment:comment, status:sts}))};

const findUserUpdateOnline = async (token) => { return (await User.findOneAndUpdate(token, { isOnline: 'N' }, { new: true })) };
const updateUser = async (username, balance) => { return (await User.findOneAndUpdate({ username: username }, { balance: balance }, { new: true })) };
const updateUserBalance = async (username, balance) => { return (await User.findOneAndUpdate({ username: username }, { $inc: { balance: balance} })) };
const updateProfile = async (username, fullname, phone, email, address) => { return (await User.findOneAndUpdate({ username: username }, { fullname: fullname, phone:phone, email:email,  address:address }, { new: true })) };
const updateUserStatus = async (username, sts) => { return (await User.findOneAndUpdate({ username: username }, { user_status: sts}, { new: true })) };
const updateUserBetStatus = async (username, sts) => { return (await User.findOneAndUpdate({ username: username }, { bet_status: sts}, { new: true })) };
const InsertDeposite = async (username, tId, amount) => { return (await DepositeRequest.findOneAndUpdate({ transectionId: tId }, { requestFrom: username, amount:amount}, { upsert:true, new: true })) };
const insertWithdrawalRequest = async (username, an, ahn, ic, m, ui, wa, p, amount, tId) => { return (await WithdrawalRequest.create( {transectionId: tId, requestFrom: username, amount:amount, an:an, ahn:ahn, ic:ic, m:m, ui:ui, wa:wa, pType:p})) };
const findSendMoney = async () => { return (await DepositeRequest.find().sort({createdAt: -1}))};

function generateOTP(limit) {
    // Declare a digits variable 
    // which stores all digits
    var digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let OTP = '';
    for (let i = 0; i < limit; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

router.post('/userType', async (req, res) => {
    console.log(req.body);
    let type = req.body.user;
    // let type = await findUserType();
    res.status(200).json({ status: true, msg: "user type list", data: type })
})


////update profile
router.post("/updateProfile/:id", async (req, res) => {
	console.log(req.body);
	let update = await updateProfile(req.body.username, req.body.fullname, req.body.phone, req.body.email,req.body.address);
	let user = await findUsername(req.body.username);
	res.send({status:true, msg:'Profile updated successfully', user:user[0]})
})


router.post("/register", async (req, res) => {
    let otp = await generateOTP(7);
    let user = await findUser({ hash_new: req.header('token') });
    const newPerson = new User({
        username: req.body.username.toLowerCase(),
        fullname: req.body.fullname,
        hash: req.body.pass,
        userType: req.body.userType,
        parentid: user[0].username,
        verifyCode: otp,
    });
    newPerson.save((err) => {
        if (err) {
            return res.status(200).json({ status: false, msg: err })
        } else {
            return res.status(200).json({ status: true, msg: "Account Created successfully" })
        }
    });
})


router.post("/deposit", async (req, res) => {
    console.log(req.body)
    let otp = await generateOTP(20);
    let sender = await findUser({ hash_new: req.header('token') });
    let reciever = await findUsername(req.body.toUser);
    let amount = req.body.chips;
    // console.log(amount, sender[0].balance, reciever[0].balance)
    if (amount < sender[0].balance) {
        const newDebit = new Wallet({
            fromUser: sender[0].username.toLowerCase(),
            toUser: reciever[0].username.toLowerCase(),
            amount: amount,
            transectionId: otp,
            transectionType: 'Debit',
            status: 1,
        });
        newDebit.save((err) => {
            if (err) {
                console.log(err)
                return res.status(200).json({ status: false, msg: err })
            }
        });
    await updateUser(sender[0].username, (sender[0].balance - amount));
    await updateUser(reciever[0].username, (parseFloat(reciever[0].balance) + parseFloat(amount)));
   let usersAll = await findAllUser();
    	return res.status(200).json({ status: true, msg: "Amount Send successfully", data: sender[0].balance - amount, user:usersAll })
    } else {
        return res.status(200).json({ status: false, msg: "Low Wallet" })
    }
})


router.post("/withdraw", async (req, res) => {
    console.log(req.body)
    let otp = await generateOTP(20);
    let sender = await findUser({ hash_new: req.header('token') });
    let reciever = await findUsername(req.body.toUser);
    let amount = req.body.chips;
    console.log(amount, sender[0].balance, reciever[0].balance)
    if (amount < sender[0].balance) {
        const newDebit = new Wallet({
            fromUser: sender[0].username.toLowerCase(),
            toUser: reciever[0].username.toLowerCase(),
            amount: amount,
            transectionId: otp,
            transectionType: 'Debit',
            status: 1,
        });
        newDebit.save((err) => {
            if (err) {
                console.log(err)
                return res.status(200).json({ status: false, msg: err })
            } else {
                updateUser(sender[0].username, (sender[0].balance - amount));
                updateUser(reciever[0].username, (parseFloat(reciever[0].balance) + parseFloat(amount)));
                return res.status(200).json({ status: true, msg: "Amount Send successfully", data: sender[0].balance - amount })
            }
        });
    } else {
        return res.status(200).json({ status: false, msg: "Low Wallet" })
    }
})

////find user
router.post("/checkToken", async (req, res) => {
    // console.log(req.header('token'))
    try {
        const user = await findUser({hash_new:req.header('token')});
        console.log('check token')
    	if(user[0].userType===1){		
    		let list = await findAllUser();
    		let live = await LiveUser();
    	let exp=0; let pl=0;	
        list.map((usr)=>{
        	exp = exp+usr.exposerAmount;
        	pl = pl+usr.profit_loss;
        })
        
        return res.status(200).json({ status: true, msg: "User Profile", data:user[0], exp:exp, pl:pl, live:live.length});
        }else{
         return res.status(200).json({ status: true, msg: "User Profile", data:user[0]});
        }
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/logout/:token", async (req, res) => {
    console.log('logout system api called by user',req.params.token)
    try {
        const user = await findUserUpdateOnline({hash_new:req.params.token});
        console.log('check token')
    	// let expo = await getExposerAndLiveUser();
    		let live = await LiveUser();
        return res.status(200).json({ status: true});
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/checkTokenUser", async (req, res) => {
    // console.log(req.header('token'))
    try {
        const user = await findUser({hash_new:req.header('token')});
        // console.log(user[0].userType)
        if(user[0].userType=== 7){
            return res.status(200).json({ status: true, msg: "User Profile", data:user[0]});
        }else{
        return res.status(200).json({ status: false, msg: "Not found"});
        }
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/transaction", async (req, res) => {
    // console.log(req.header('token'))
    try {
        const user = await findUser({hash_new:req.header('token')});
        // console.log(user[0].username)
        const data = await findTransaction(user[0].username);
        return res.status(200).json({ status: true, msg: "User Transaction", data:data});
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/dhistory", async (req, res) => {
    // console.log(req.header('token'))
    try {
        const user = await findUser({hash_new:req.header('token')});
    	const data1 = await findDepositeByUsername(user[0].username);
    	const data2 = await findWithdrawalByUsername(user[0].username);
    	const allRequests = [...data1, ...data2];
		const sortedRequests = allRequests.sort((a, b) => b.createdAt - a.createdAt);
		// console.log(sortedRequests);
        return res.status(200).json({ status: true, msg: "User Transaction", data:sortedRequests});
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/list", async (req, res) => {
    console.log(req.header('token'))
    try {
        const user = await findAllUser();
        // console.log(user)
        return res.status(200).json({ status: true, msg: "User List", data:user});
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/statementUser", async (req, res) => {
    console.log(req.header('token'), req.body)
    try {
        
    	const data1 = await findTransaction(req.body.username);
        // console.log(user)
        return res.status(200).json({ status: true, msg: "Statement List", data:data1});
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/myUser", async (req, res) => {
    console.log(req.header('token'))
    try {
        const user = await findAllUser();
        // console.log(user)
        return res.status(200).json({ status: true, msg: "User List", data:user});
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/admin/deposit", async (req, res) => {
    // console.log(req.headers.token)
    try {
        let user = await findUser({ hash_new: req.headers.token });
        console.log(user[0].balance, req.body.amount)
    	let amount = parseFloat(user[0].balance) + parseFloat(req.body.amount)
        await updateUser(user[0].username, parseFloat(amount > 5000000 ? 5000000 : amount));
        let users = await findUser({ hash_new: req.headers.token });
        return res.status(200).json({ status: true, msg: amount > 5000000 ? "Wallet can't be more than 5000000" :"Point Added successfully", data: users});
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})


router.post('/check/:token', async(req, res)=>{
let user = await findUsername(req.body.userName);
// console.log(req.body, user);
if(user.length>0){
res.send({status:true, name:user[0].fullname})
}else{
res.send({status:false, name:'No User Found'})
}
})

router.post('/find', async(req, res)=>{

let user = await findUsername(req.body.username);
// console.log(req.body, user)
res.send({status:true, user:user})
})

router.post('/lock', async(req, res)=>{
let update = await updateUserStatus(req.body.username, req.body.status)
console.log(req.body)
if(req.body.status === 'N'){
res.send({status:true, msg:'User Locked Successfully'})
}else{
res.send({status:true, msg:'User Unlocked Successfully'})
}
})

router.post('/betlock', async(req, res)=>{
let update = await updateUserBetStatus(req.body.username, req.body.status)
console.log(req.body)
if(req.body.status === 'N'){
res.send({status:true, msg:'Bet Locked Successfully'})
}else{
res.send({status:true, msg:'Bet Unlocked Successfully'})
}
})


router.post('/sendMoney', async(req, res)=>{

let getClient = await findUsername(req.body.clientname);
let getUser = await findUsername(req.body.username);
if(getUser.length>0){
	if(getUser[0].balance > req.body.amount){
    console.log('balance is full')
    let client = await updateUser(getClient[0].username, parseInt(getClient[0].balance) + parseInt(req.body.amount));
    let user = await updateUser(getUser[0].username, parseInt(getUser[0].balance) - parseInt(req.body.amount));
    
	res.send({status:true, msg:'Amount Transfered Successfully', bal:(getUser[0].balance - req.body.amount)})
	}else{ 
    	console.log('Balance is not ok')
    	res.send({status:false, msg:'Low Balance'})
        }
}else{
console.log('User not verified')
}
})

router.post('/depositRequest', async(req, res)=>{
	console.log(req.body);
	if (!req.body.username || !req.body.tId || !req.body.chips) {
    	return res.status(400).send({ status: false, msg: "Invalid request. Missing required parameters." });
	}
	let checktId = await CheckTid(req.body.tId);
	let filteredData = checktId.filter(item => item.status !== 2);
	
	if(filteredData && filteredData.length > 0){
		res.send({status:false, msg:'Transection ID already used.'})
	}else{
    let insert = await InsertDeposite(req.body.username, req.body.tId, parseInt(req.body.chips))
		res.send({status:true, msg:"Request Send successfully."})
	}
})


router.post('/withdrawalRequest', async(req, res)=>{
	
	let user = await findUsername(req.body.username);
	if(user[0].balance < req.body.amount){
    	console.log('Low Balance')
    	res.send({status:false, msg:'Low wallet balance'})
	   	return;
    }
	let tId = await generateOTP(15);
	let iwl = await insertWithdrawalRequest(req.body.username, req.body.AN, req.body.AHN, req.body.IC, req.body.M, req.body.UI, req.body.WA, req.body.P, req.body.amount, tId);
	let update = await updateUser(req.body.username, (user[0].balance-req.body.amount));
	res.send({status:true, msg:'Request send successfully', wallet:user[0].balance-req.body.amount})
})

router.post('/withdrawlResponce', async(req, res)=>{
	console.log(req.body);
	if( req.body.status === 2){
	let withDraw = await findWithdrawalbyId(req.body.id);
	let updateBal = await updateUserBalance(withDraw[0].requestFrom, + withDraw[0].amount);
    }
	let update = await updateWithdrawalByID(req.body.id, req.body.remark, req.body.status)
    let transaction = await findWithdrawal();
	res.send({status:true, msg:'Request send successfully',data: transaction})
})


router.post('/sendmoneyResponce', async(req, res)=>{
	console.log(req.body);
	 if( req.body.status === 1){
     let tId = await generateOTP(15);
	let withDeposit = await findDepositbyId(req.body.id);
	let reciever = await updateUserBalance(withDeposit[0].requestFrom, + withDeposit[0].amount);
     let sender = await updateUserBalance( req.body.acceptBy, - withDeposit[0].amount);
     const newDebit = new Wallet({
        fromUser: req.body.acceptBy.toLowerCase(),
        toUser: withDeposit[0].requestFrom.toLowerCase(),
        amount: withDeposit[0].amount,
        transectionId: tId,
        transectionType: 'Debit',
        status: 1,
    });
    await newDebit.save()
	}
	let update = await updateDepositeByID(req.body.id, req.body.remark, req.body.status)
    let transaction = await findSendMoney();
	res.send({status:true, msg:'Request send successfully',data: transaction})
})

router.post("/check", async (req, res) => {
			console.log('username data',req.body);
	let user = await findUsername(req.body.u);
	if(user.length > 0){
    	res.send({status:false, msg:'Username already used'})
    }else{
    	res.send({status:true, msg:req.body.u+ ' is valid username'})
    }
});

router.post("/selfRegister", async (req, res) => {
    let otp = await generateOTP(7);
	let user = await findUserBytype(1);
    const newPerson = new User({
        username: req.body.u.toLowerCase(),
        fullname: req.body.f,
        hash: req.body.p,
        userType: 7,
        parentid: user[0].username,
        verifyCode: otp,
    });
    newPerson.save((err) => {
        if (err) {
            return res.status(200).json({ status: false, msg: 'Something went worng' })
        } else {
            return res.status(200).json({ status: true, msg: "Account Created successfully" })
        }
    });
})















module.exports = router