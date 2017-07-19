var fs = require('fs');
var express = require('expresss');
var expressValidator = require('expressValidator');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');

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

// Mongoose
mongoose.connect('mongodb://localhost/task_management');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(){
	console.log('Connected to Database');
});

var taskSchema = mongoose.Schema({
	id: Number,
	title: String,
	description: String,
	image: {
		data: Buffer,
		contentType: String
	},
	created_at: Date,
	updated_at: Date
});

taskSchema.pre('save', function(next){
	var currentDate = new Date();
	this.updated_at = currentDate;

	if(!this.createdAt){
		this.created_at = currentDate;
	}
	next();
});

var Task = mongoose.model('task', taskSchema);

//Init App
app.listen(3000, function(){
	console.log('listening on port 3000');
});

