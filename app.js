const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const cors = require('cors')
const compression = require('compression');
const app = express();

app.use(compression({
    level: 6,
    threshold: 0,
}));

app.use(cors());

app.use(express.static(__dirname + '/uploads'));

app.use(bodyParser.json({ limit: '1024mb' }));
app.use(bodyParser.urlencoded({
    limit: '1024mb',
    extended: true,
    parameterLimit: 50000
}));
// OPTIONS

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'pecuniamsekretsession',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

app.use(flash());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Routes
app.use('/individual', require('./routes/individual'));
app.use('/bussiness', require('./routes/bussiness'));
app.use('/filesave', require('./routes/SaveFile'));
app.use('/category', require('./routes/category'));
app.use('/tax', require('./routes/tax'));
app.use('/hsn', require('./routes/hsn'));
app.use('/codedomain', require('./routes/code_domain'));
app.use('/codedomain/values', require('./routes/code_domainValues'));
app.use('/relaited/codedomain', require('./routes/related_domain'));
app.use('/product', require('./routes/product'));
app.use('/subscriptionplan', require('./routes/subscriptionplan'));
app.use('/sellerstory', require('./routes/sellerstory'));
app.use("/service", require("./routes/route_service"));
app.use("/usermaster", require("./routes/usermaster"));
app.use("/emailsmsconfig", require("./routes/emailsmsconfig"));
app.use("/comm_temp", require("./routes/route_comm_template"));
app.use("/comm_compositions", require("./routes/comm_compositions"));
app.use("/comm_history", require("./routes/comm_history"));
app.use("/role", require("./routes/role"));
app.use("/rolePermission", require("./routes/rolePermission"));
app.use("/events", require("./routes/event"));
app.use("/otp", require("./routes/otp"));
app.use("/setting", require("./routes/setting"));
app.use("/history", require("./routes/history"));
app.use("/notes", require("./routes/notes"));
app.use("/sell_globally", require("./routes/sell_globally"));
app.use("/buyer", require("./routes/buyer"));
app.use("/scriptexecute", require("./routes/script"));

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
