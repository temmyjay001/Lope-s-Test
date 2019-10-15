/**
* Module dependencies.
*/
const express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fileUpload = require('express-fileupload')
  , bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const mysql      = require('mysql');
const bodyParser=require("body-parser");

/*
  Work on converting this database to MongoDb 
*/ 
const connection = mysql.createConnection({
              dateStrings :'date',
              host     : 'localhost',
              user     : 'root',
              password : '',
              database : 'Lope'
            });
 
connection.connect();
 
global.db = connection;
 
// all environments
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static('public'));
app.use(fileUpload());
app.use(session({
              secret: 'keyboard cat',
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 100000 }
}));

// development only
// Easy routing for the API
app.get('/', routes.index);//call for main index page
app.get('/signup', user.signup);//call for signup page
app.post('/signup', user.signup);//call for signup post 
app.get('/login', routes.index);//call for login page
app.post('/login', user.login);//call for login post
app.get('/home/dashboard', user.dashboard);//call for dashboard page after login
app.get('/home/logout', user.logout);//call for logout
app.get('/home/profile',user.profile);//to render users profile
app.get('/home/write',user.write);//call for write page
app.get('/home/write/save',user.write);//call for write page
app.post('/home/write/save',user.write);//call for save post
app.get('/home/read',user.read);//call for read page
app.post('/home/read',user.getMessage);//redirect the posted message to the get message function 
app.get('/home/read/getMessage',user.getMessage);//redirect to mread
app.post('/home/read/getMessage',user.getMessage);//redirects the form from read to mread page
app.get('/home/manage',user.manage);//call for manage page
app.post('/home/manage',user.manage);//call for manage post

