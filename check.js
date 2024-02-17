// pm2 start index.js and also watch command used for 24 hour running app and monutering the app with change dont need to start again work like nodemon
const express = require('express');
const app = express();
const PORT = 6600
const mongoose = require('mongoose');
const morgan =require('morgan');
const helmet =require('helmet');
const multer =require('multer');
const cors = require('cors')
const path = require('path')
const cookieParser = require("cookie-parser");
const session = require('express-session');
// var bodyParser = require('body-parser')


const Post = require('./models/Post')
const User = require('./models/User')

///session timeconst oneDay = 1000 * 60 * 60 * 24;
const min5 = 1000 * 60 * 48;


////api routes
const userRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');

///web_api routes
const contactRoute = require('./routes/contact');
const expertRoute = require('./routes/elogin');
const civilRoute = require('./routes/clogin');
const systemRoute = require('./routes/system');
const usersRoute = require('./routes/users');
const postsRoute = require('./routes/posts');
const firsRoute = require('./routes/firs');
const expertsRoute = require('./routes/experts');
const MongoUrl = 'mongodb+srv://blacklist_expert:blacklist_expert@cluster0.1gx2mar.mongodb.net/blacklist?retryWrites=true&w=majority';
mongoose.connect(MongoUrl, 
{
    useNewUrlParser:true,
    useUnifiedTopology:true
},()=>{
    console.warn('server start....')
});


////login check middeware
const redirectLogin = (req, res, next) => {
	if(!req.session.token){
		res.redirect('/')
	}else{
		next()
	}
}

const redirectHome = (req, res, next) => {
	if(req.session.token){
		// let result={
		// 	name:req.session.name,
		// 	role:req.session.role,
		// }
		res.redirect('/dashboard')
	}else{
		next()
	}
}


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "blacklistsecretkeyishere",
    saveUninitialized:true,
	sameSite:true,
	secure:true,
    cookie: { maxAge: min5 },
    resave: false 
}));
app.use(helmet());
app.use(morgan("common"));
app.use(cors());


// cookie parser middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, ('/public'))));

///apis for app
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);
app.use("/api/contact", contactRoute);

//// web api routes
app.use("/web/expert",  expertRoute);
app.use("/web/civil",  civilRoute);
app.use("/", systemRoute);
app.use("/", postsRoute);
app.use("/", firsRoute);
app.use("/", expertsRoute);
app.use("/", usersRoute);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// store user information in session, typically a user id
    // req.session.user = req.body.user




app.get('/',  (req,res)=>{	
	const data = Post
	.find({})
	.populate("uid");
	console.log(data)
})
////if no page found
app.get('*', function(req, res){
  res.render('auth/404')
});

app.listen(PORT,()=>{
    console.warn('App is running port 6600...');
})