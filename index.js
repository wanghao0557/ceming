'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient =require('mongodb').MongoClient;
const moment = require('moment');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var textDetctor = require('./text-detctor');
var databaseObj = {};
var ObjectId = require('mongodb').ObjectId;
const app = express();

app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({limit:'50mb', extended: true}));
app.use(bodyParser.json({limit:'50mb'}));

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './upload/');
    },
    filename: function(req, file, cb) {
        var originalName = file.originalname;
        var arr = originalName.split('.');
        var extenal = arr[arr.length - 1];
        cb(null, file.fieldname + '-' + Date.now()+'.'+extenal);
    }
});
var uploadDir = multer({storage: storage});
app.get('/', (req, res) => {
	var cursor = databaseObj.db.collection('forrecords').find({}).sort({'createTime': -1}).toArray((err, results) => {
		if (err) {
			return console.log(err);
		}
		res.render('index.ejs', {
			title: "记录列表",
			quotes: results
		});
	});
});

app.get('/add', (req, res) => {
	res.render('add.ejs', {
		title: "增加记录"
	});
});

app.post('/add', (req, res) => {
	databaseObj.db.collection('forrecords').save(req.body, (err, result) => {
		if(err) {
			return console.log(err);
		}
		console.log('saved to database');
		res.redirect('/');
	});
});

app.get('/edit', function(req, res) {
	var id = req.query.id;
	databaseObj.db.collection('forrecords').findOne({"_id": ObjectId(id)}, {}, function(err, record) {
		res.render('edit.ejs', {
			title: "修改记录",
			record: record
		});
	});
});

app.post('/edit', function(req, res) {
	var id = req.body.id;
	databaseObj.db.collection('forrecords').updateOne({"_id": ObjectId(id)}, { $set: req.body }, function(err, record) {
		if(err) {
			return console.log(err);
		}
		res.redirect('/');
	});
});

app.put('/quotes', (req, res) => {
	databaseObj.db.collection('forrecords').findOneAndUpdate({name: 'book'}, {
		$set: {
			name: req.body.name,
			quote: req.body.quote
		}
	}, {
		sort: {_id: -1},
		upsert: true
	}, (err, result) => {
		if(err) {
			return res.send(err);
		}
		res.send(result)
	});
});

app.get('/del', (req, res) => {
	var id = req.query.id;
	databaseObj.db.collection('forrecords').findOneAndDelete({'_id': ObjectId(id)}, (err, result) => {
		if(err) {
			return res.send(500, err);
		}
		res.redirect('/');
	});
});

app.delete('/quotes', (req, res) => {
	var id = req.query.id;
	databaseObj.db.collection('forrecords').findOneAndDelete({'_id': ObjectId(id)}, (err, result) => {
		if(err) {
			return res.send(500, err);
		}
		res.send({message: 'success'});
	});
});

app.get('/text', (req, res) => {
	res.render('text.ejs', {
		title: '文字识别'
	});
});

app.post('/accurate', function(req, res) {
    var reqBody = req.body;
    var imgData = reqBody.photos;
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, '');
    textDetctor(base64Data, function(err, data) {
        if(err) {
            res.json({resultCode: '500', resultMsg: '服务器错误', err: err});
        }
        res.json({resultCode: '000000', resultMsg: '请求处理成功', data: {textResult: data, name: reqBody.name}});
    });
});
//use mongodb
MongoClient.connect('mongodb://ceming:qw12qw12@ds127982.mlab.com:27982/ceapp', (err, db)  => {
	if (err) {
		return console.log(err);
	}
	databaseObj.db = db;
	app.listen(app.get('port'), () => {
		console.log(`app starting at ${app.get('port')}`);
	});
});