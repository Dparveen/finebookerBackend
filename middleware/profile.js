var path = require('path');
var multer = require('multer');


var storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, "public/profile")
	},
	filename: function(req, file, cb){
		
		cb(null, Date.now()+"proof"+file.originalname)
	}
})

var upload = multer({
	storage:storage,
	fileFilter: function(req, file, callback){
		if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
			
			callback(null, true)
		}
		else{
			console.warn({msg:'Only .png, .jpg, .jpeg format allowed!', status:false})
			callback(null, false)
		}
	},
	limits:{ fileSize: 1024 * 1024 * 2}
})


module.exports = upload