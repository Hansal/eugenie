var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session')

var index = require('./routes/index');
var admin = require('./routes/admin');
var gallery = require('./routes/gallery');
var album = require('./routes/album');


const config = require('/etc/eugenie/config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }));
app.use(bodyParser.raw({ limit: '50mb'}) );
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [config.session.key],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/admin', admin);
app.use('/gallery', gallery);
app.use('/albums', album);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
