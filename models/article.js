var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');

var PORT = 3000;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));


app.use(express.static('public'));


var db = mongoose.createConnection('');


db.on('error', function(err) {
    console.log('Mongoose Error: ', err);
});


db.once('open', function(){
    console.log('Mongoose connection successful.');
});

//SCRAPING
request('http://www.awwards.com/websites/clean/', function(error, response, html) {
    var $ = cheerio.load(html);
    var result = []; //Empty array for holding our data
    $('figure.site').each(function(i, element) { //LOOK AT ALL ARTICLES
        var article = $(element).find('a').find('img').attr('src'); //CHEERIO FINDS FIRST MATCHING CHILD
        result.push({'Link': article}); //Pushing the article to the empty array made on line 36
    });
    console.log(result); // logging out result
});

//MODELS
var Article = require('./models/Article.js');
var Comments = require('./models/Comments.js');
var User = require('./models/User.js');

//New user
var exampleUser = new User({
    name: 'Kanye West'
});

exampleUser.save(function(err, doc) {
    //LOG ERRORS
    if (err){
        console.log(err);
        //OR LOG THE DOC
    } else {
        console.log(doc);
    }
});

//ROUTES

//home
app.get('/', function(req, res) {
    res.send(index.html);
});

//comments
app.get('/comments', function(req, res) {
    Note.find({}, function(err, doc) {
        if (err) {
            res.send(err);
        } else {
            res.send(doc);
        }
    });
});

//comment creator
app.post('/submit', function(req, res){
    var newComment = new Comment(req.body);
    newComment.save(function(err, doc){
        if (err) {
            console.log(err);
        } else {
            User.findOneAndUpdate({}, {$push: {'notes': doc.id}}, {new: true}, function(err, doc) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(doc);
                }
            });
        }
    });
});

//user routes
app.get('/user', function(req, res) {
    User.find({}, function(err, doc) {
        if(err) {
            res.send(err);
        } else {
            res.send(doc);
        }
    });
});

//user's articles
app.get('/populatedUser', function(req, res) {
    User.find({})
        .populate('notes')
        .exec(function(err, doc) {
            if (err) {
                res.send(err);
            } else {
                res.send(doc);
            }
        });
});

// Listen to Port 3005
app.listen(PORT, function() {
    console.log('App running on port 3000');
});