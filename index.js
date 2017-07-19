var fs = require('fs');
var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');

var app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
var urlencodedParser = bodyParser.urlencoded({extend: false});
app.use(urlencodedParser);
app.use(expressValidator());

// Multer
var storage =  multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, 'public/img/upload');
	},
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
		imagePath: String,
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

app.get('/', function (req, res){
	try {
		Task.find({}, function(err, data) {
			if(err){
				console.log(err);
				var errorMessage = "Error - Unable to fetch data from database"
				res.send(errorMessage);
			} else {
				res.render('mainpage', {data: data});
			}
		})
	} catch(e){
		res.send(e);
	}
});

app.get('/admin', function (req,res){
	res.render('addItem');
});

app.post('/upload', urlencodedParser, function (req, res){
	upload(req, res, function(err){
		if(err) {
			console.log(err);
		} else {
			// Validation
			req.checkBody('id', 'id cannot be empty').notEmpty();
			req.checkBody('id', 'id must be a number').isInt()
			req.checkBody('title', 'title cannot be empty').notEmpty();
			req.checkBody('description', 'description cannot be empty').notEmpty();

			const errors = req.validationErrors();

			if(errors) {
				errors.forEach(function(error){
					console.log(error);
				})
				res.render('addItemError', {
					errors: errors
				});
			} else {
				var id = req.body.id;
				var title = req.body.title;
				var description = req.body.description;

				var imagePath = req.file.path.slice(7);
				var newTask = new Task({
					id: id,
					title: title,
					description: description,
					image: {
						data: imagePath,
						imagePath: req.file.path,
						contentType: 'image/jpeg'
					},
					created_at: Date.now()
				});
				//console.log(req.body);
				newTask.save(function(err){
					if(err) {
						console.log(err);
					} else {
						res.redirect('/');
					}
				});
			}
			
		}
	})
});

app.get('/edit/:id', function (req, res){
	var editId = req.params.id;
	res.render('editItem', {data: editId});
});

app.post('/edit/:id', urlencodedParser, function (req, res){
	var editId = req.params.id;
	upload(req, res, function(err){
		if(err) {
			console.log(err);
		} else {
			// Validation
			req.checkBody('id', 'id cannot be empty').notEmpty();
			req.checkBody('id', 'id must be a number').isInt()
			req.checkBody('title', 'title cannot be empty').notEmpty();
			req.checkBody('description', 'description cannot be empty').notEmpty();

			const errors = req.validationErrors();

			if(errors) {
				errors.forEach(function(error){
					console.log(error);
				})
				res.render('editItemError', {
					errors: errors
				});
			} else {
				var imageData = req.file.path.slice(7);
				Task.findOneAndUpdate({id: editId}, {
					title: req.body.title,
					description: req.body.description,
					//var imagePath: req.file.path.slice(7);
					image: {
						data: imageData,
						imagePath: req.file.path
					}
				}, {upsert:true} ,function (err, task){
					if(err) {
						console.log(err);
					}
					res.redirect('/');
				});
			}
			
		}
	})
});

app.get('/remove/:id', function (req,res){
	var removeId = req.params.id;
	var removeTask;
	Task.findOne({id: removeId}, function(err, task){
		if(err){
			console.log(err)
		} else {
			removeTask = task;
			Task.remove({id: removeId}, function(err){
				if(err){
					console.log(err);
				} else {
					fs.unlink('./'+ removeTask.image.imagePath, function(err){
						if (err) {
							console.log(err);
						} else{
							res.redirect('/');
						}
					});
				
				}
			});
		}
	});
});



