var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var flash = require('connect-flash');

var routes = require('./routes/index');
var midiRoute = require('./routes/midiRoute');

// create a write stream for access log
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flag: 'a'});

// connect to mongodb://localhost/online-studio
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/online-studio');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// set favicon
app.use(favicon(__dirname+"/public/icons/favicon.ico"));

// setup the logger
app.use(morgan('common', {stream: accessLogStream}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(expressSession({secret: 'mySecretKeyabc123', resave: true, saveUninitialized: true}));
app.use(flash());

app.use('/', routes);
app.use('/midi', midiRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    if (err.status === 404) {
      res.status(err.status);
      res.render('error/404', {
        message: err.message,
        error: err
      });
    } else {
      res.status(500);
      res.render('error/500', {
        message: err.message,
        error: err
      });
    }
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  if (err.status === 404) {
    res.status(err.status);
    res.render('error/404');
  } else {
    res.status(500);
    res.render('error/500');
  }
});


module.exports = app;
