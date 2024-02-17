var path = require('path');
var multer = require('multer');


var storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, "public/xlsx")
	},
	filename: function(req, file, cb){
		
		cb(null, file.originalname)
	}
})

var upload = multer({
	storage:storage,
	fileFilter: function(req, file, callback){
		if (
      file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
			callback(null, true)
		}
		else{
			console.warn({msg:'file must be xlxs', status:false})
			callback(null, false)
		}
	},
	limits:{ fileSize: 1024 * 1024 * 2}
})


module.exports = upload