var fs = require('fs');
var express = require('expresss');
var expressValidator = require('expressValidator');
var bodyParser = require('body-parser');
var multer = require('multer');

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.urlencodedParser({extended: false}));
app.use(expressValidator);

// Multer
var storage =  multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, 'public/img/uload');
	}
	filename: function(req, file, cb){
		cb(null, Date.now() + file.originalname);
	}
});
var upload = multer({storage: storage}).single('imageFile');

app.listen(3000, function(){
	console.log('listening on port 3000');
})