const router = require('express').Router();
const User = require('../models/User');
const createHash = require('hash-generator');
const Wallet = require('../models/Wallet');
const UserType = require('../models/UserType');
const DepositeRequest = require('../models/DepositeRequest');
const WithdrawalRequest = require('../models/WithdrwalRequest');

const findUserType = async () => { return (await UserType.find({ status: 1 })) };
const findByParentID = async (pid) =>{ return (await User.find({parentid:pid}))};
const findUser = async (token) => { return (await User.findOne(token)) };
const findAllUser = async () => { return (await User.find()) };
const findUsername = async (username) => { return (await User.find({ username: username })) };
const findOUTTransaction = async (user) => { return (await Wallet.find({ fromUser: user }))};
const findINTransaction = async (user) => { return (await Wallet.find({ toUser: user }))};

const findSendMoney = async () => { return (await DepositeRequest.find().sort({createdAt: -1}))};
const findWithdrawal = async () => { return (await WithdrawalRequest.find().sort({createdAt: -1}))};

const updateUser = async (username, balance) => { return (await User.findOneAndUpdate({ username: username }, { balance: balance }, { new: true })) };
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

router.post('/in/:token', async (req, res) => {
    // console.log(req.params)
    let user = await findUser({hash_new:req.params.token});
    // console.log(user)
    // let type = req.body.user;
    let transaction = await findINTransaction(user.username);
    // console.log(transaction);
    res.status(200).json({ status: true, msg: "user type list", data: transaction})
})

router.post('/out/:token', async (req, res) => {
    // console.log(req.params)
    let user = await findUser({hash_new:req.params.token});
    // console.log(user)
    // let type = req.body.user;
    let transaction = await findOUTTransaction(user.username);
    // console.log(transaction);
    res.status(200).json({ status: true, msg: "user type list", data: transaction})
})

router.post('/sendMoney/:token', async(req, res)=>{
	 // console.log(req.params)
    let user = await findUser({hash_new:req.params.token});
    // console.log(user)
    // let type = req.body.user;
    let transaction = await findSendMoney();
    // console.log(transaction);
    res.status(200).json({ status: true, msg: "Send Money Request List", data: transaction})
})

router.post('/withdrawal/:token', async(req, res)=>{
	 // console.log(req.params)
    let user = await findUser({hash_new:req.params.token});
    // console.log(user)
    // let type = req.body.user;
    let transaction = await findWithdrawal();
    // console.log(transaction);
    res.status(200).json({ status: true, msg: "Withdrawal Request List", data: transaction})
})


module.exports = router