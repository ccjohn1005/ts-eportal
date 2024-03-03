const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const nodemailer = require("nodemailer");

// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');


// Login Page
router.get('/login', forwardAuthenticated,  (req, res) => { res.render('login')});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2, empNo, department } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2 || !empNo || !department) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.indexOf(' ') > -1) {
    errors.push({ msg: 'Password cannot contain spaces!' })
  }


  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
      empNo,
      department
    });
  } else {
    User.findOne({ email: email } && {empNo: empNo}).then(user => {
      // console.log(user)
      if (user) {
        errors.push({ msg: 'Email or Employee No. already exists. ' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
          empNo,
          department
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          empNo,
          department
        });

        const transporter = nodemailer.createTransport({
          host: `${process.env.host}`,
          port: `${process.env.emailPORT}`,
          secure: false,
          auth: {
            user: `${process.env.user}`,
            pass: `${process.env.password}`,
          },
        });
      
        const mailOptions = {
          from: `${process.env.user}`,
          to: `john.chew@tekseng.co`, // findstaff.email is requestor email, findUser.email is approver
          subject: `User Registration Info`,
          html: `<b>${newUser}<b>`,
        };
      
        const sendUserInfo =  transporter.sendMail(mailOptions, (error, info) => {
          if (error) throw error;
            console.log(error);
            // res.send("error! Failed");
            // return res.redirect('/users/login');
          // } else {
            console.log("Email sent: " + info.response);
          
          next();
        });




        // Hash Password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to save
            newUser.password = hash;
            // Save User
            newUser.save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });

      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
  req.session.destroy();
  res.clearCookie('connect.sid');
});

module.exports = router;

