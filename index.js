// (pm2 start env.js --watch --ignore-watch="node_modules" -i max --env production) and also watch command used for 24 hour running app and monutering the app with change dont need to start again work like nodemon
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const PORT = 6600;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const multer = require('multer');
const cors = require('cors')
const path = require('path')
const axios = require('axios');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const cron = require('node-cron');
const schedule = '* * * * * *';
const User = require('./models/User');
const Banner = require('./models/Banner');
// const SportsData = require('./data/sports.json');
// const EventsData = require('./data/events.json');
// const MatchData = require('./data/match.json');
// const MarketData = require('./data/market.json');
// const Runner = require('./data/runner.json');
// const OddData = require('./data/odds.json');
// const SessionData = require('./data/session.json');
require('./middleware/mainnet');
const MongoUrl = 'mongodb+srv://blacklist_expert:blacklist_expert@cluster0.1gx2mar.mongodb.net/bazeeplay?retryWrites=true&w=majority';
mongoose.connect(MongoUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () => {
        console.warn('server start....')
    });

// const Score = Fetch score URL: http://142.93.36.1/api/v1/score?match_id=29625129  ////this is for score requests

///session timeconst oneDay = 1000 * 60 * 60 * 24;
const min5 = 1000 * 10;


////api routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const gameRoute = require('./routes/game');
const walletRoute = require('./routes/wallet');

const findBanners = async () => { return await Banner.find() };
const uploadBanner = async(img) => {return await Banner.create({ url: img })}
const findUser = async (token) => { return await User.find({hash_new:token}) };



const getMArketApi = async (url) => {
// console.log('called', {url:url})
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      // url: `https://dream.bagpackkar.com/d110923/shyamp/getMarket?match_id=33002782`,
    	// url:`https://dream.bagpackkar.com/d110923/shyamp/getMatches?series_id=12547929&game_id=4`,
		url:url,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.request(config);
  	// if(response.data.length > 0){
  	// await Session.findOneAndUpdate(
  	// { matchId: mId },
  	// { session: response.data },
  	// { upsert: true, new: true },
  	// (err, bm) => {
  	// if (err) {
  	// console.error('Error:', err);
  	// }
  	// }
  	// ).clone().catch(function (err) { console.log('clone') })
  	// }
  console.log(response.data, config)
  	return response.data;

  } catch (error) {
    console.error(error);
    return { status: false, msg: 'Error fetching games', data: [] };
  }
}


const auth = async (req, res, next) => {
    // console.log(req.headers.token);
    // let token = req.header('token');
    let authToken = await findUser(req.header.token);
    // console.log(authToken)
    if (authToken.length > 0) {
        next()
    } else {
        return res.status(200).json({ status: false, msg: "Authentication failed" });
    }
}

const corsOptions = {
    // origin: 'http://localhost:3000', // '*' allows any origin (for demonstration purposes)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow the necessary HTTP methods
    // allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*'); // Allow any origin for demonstration purposes
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     next();
// });
app.use(session({
    secret: "blacklistsecretkeyishere",
    saveUninitialized: true,
    sameSite: true,
    secure: true,
    cookie: { maxAge: min5 },
    resave: false
}));

app.use(helmet());
app.use(morgan("common"));


// cookie parser middleware
app.use(cookieParser());
app.use((req, res, next) => {
    if (req.session && req.session.user) {
        const currentTime = new Date().getTime();
        const sessionExpiration = req.session.cookie.originalMaxAge;
        const sessionEndTime = req.session.lastAccess + sessionExpiration;
        if (currentTime > sessionEndTime) {
            req.session.destroy();
            res.redirect('/logout');
        } else {
            req.session.lastAccess = currentTime;
            next();
        }
    } else {
        next();
    }
});
///apis for app
app.use("/api/auth", authRoute);
app.use("/api/users", auth, userRoute);
app.use("/api/game", auth, gameRoute);
app.use("/api/wallet", auth, walletRoute);

app.get('/check', async(req, res)=>{
	let data = await getMArketApi(req.body.url);
	res.send(data);
})

app.post('/api/uploadBanner/:token', async(req, res)=>{
	
	let upload = await uploadBanner(req.body.image)
	console.log(req.body)
	let banner = await findBanners();
    res.send({ status: true, banner: banner });
})


app.get('/api/banners/:token', async (req, res) => {
    let banner = await findBanners();
    res.send({ status: true, banner: banner });
});




io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('message', (msg) => {
    console.log('Message from client:', msg);
    // Broadcast the message to all clients
    io.emit('message', msg);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});