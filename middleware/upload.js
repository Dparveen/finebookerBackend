var path = require('path');
var multer = require('multer');
const shortid = require("shortid");


// var storage = multer.diskStorage({
// 	destination: function(req, file, cb){
// 		cb(null, "public/upload")
// 	},
// 	filename: function(req, file, cb){
		
// 		cb(null, Date.now()+"proof"+file.originalname)
// 	}
// })



const storage = multer.diskStorage({
  	destination: function(req, file, cb){
		
		console.log(file)
		cb(null, "public/upload")
	},
  filename: function (req, file, cb) {
    console.log(file.originalname);
    const imageName = file.originalname.split(" ").join("_");

    cb(null, shortid.generate() + "-" + imageName);
  },
});

var upload = multer({
	storage:storage,
	fileFilter: function(req, file, callback){
		console.log(file)
		if (
      file.mimetype == "image/png" ||
      file.mimetype == "application/msword" ||
      file.mimetype == "video/mp4" ||
      file.mimetype == "video/mpeg" ||
      file.mimetype == "application/pdf" ||
      file.mimetype == "video/x-msvideo" ||
      file.mimetype == "image/jpg" ||
	  file.mimetype == "audio/mpeg" ||
	  file.mimetype == "audio/vnd.wav" ||
      file.mimetype == "image/jpeg"
    ) {
			
			callback(null, true)
		}
		else{
			console.warn({msg:'Only .png, .jpg, .jpeg, .pdf, .mp4, .mpeg4, .avi and .doc format allowed!', status:false})
			callback(null, false)
		}
	},
	limits:{ fileSize: 1024 * 1024 * 2}
})


module.exports = upload