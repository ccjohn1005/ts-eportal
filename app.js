const express = require('express');
const bodyParser = require('body-parser');
const EJS  = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const path = require('path');
const dotenv = require('dotenv');


const app = express();

require('dotenv').config()


// Passport Config
require('./config/passport')(passport);


// DB Config
const database = process.env.DBPassword
const { connect } = require('./routes');

// Connect to MongoDB
mongoose.connect(
  database,
  { useNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false 
  })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Express body parser
app.use(express.urlencoded({ extended: true }));


// Express session
app.use(
  session({
    secret: 'ts-secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create ({
      mongoUrl: database,
      secret: 'process.env.SessionKey',
      ttl: 1 * 24 * 60 * 60, // = 2 days. Default
      autoRemove: 'native',
      collectionName: 'mySessions',
      touchAfter: 24 * 3600, // time period in seconds
      cookie: {
        httpOnly: true,
        _expires: Date.now() + 6 * 60 * 60 * 1000 ,
        originalMaxAge: 6 * 60 * 60 * 1000 // 24 hours /* 6 * 60 * 60 * 1000 = 6 hours */
      }
    })
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/', require('./routes/dashboard'))
app.use('/', require('./routes/upload'));
app.use('/', require('./routes/empprofile'));
app.use('/', require('./routes/leave/leave'));
app.use('/', require('./routes/changepsswd.js'));
app.use('/', require('./routes/mssql.js'));


// app.use(function (req,res) {
//   res.status(404).send('Invalid URL!');
// })


const PORT = process.env.PORT ;

app.listen(PORT, console.log(`Server running on ${PORT}`));




