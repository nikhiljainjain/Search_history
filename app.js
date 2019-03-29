var createError = require('http-errors'),
express = require('express'),
path = require('path'),
cookieParser = require('cookie-parser'),
logger = require('morgan'),
mongoose = require('mongoose'),
config = require('./config'),
indexRouter = require('./routes/index'),
usersRouter = require('./routes/users'),
expressValidator = require('express-validator'),
expressSession = require('express-session'),
genuuid = require('genid'),
app = express();

mongoose.connect(config.mongodbURL, {useNewUrlParser: true}, (err) => {
    if (err) {
        console.error.bind(console, 'connection error: ');
    }
    console.log("Database connected");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('node_modules'));
app.use(expressSession({genid : (req)=>{return genuuid()}, 
      secret : config.sessionSecret, saveUninitialized : false, resave: false, 
      cookie: {maxAge: 86400000}}));
app.disable('etag');
app.disable('x-powered-by');


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
