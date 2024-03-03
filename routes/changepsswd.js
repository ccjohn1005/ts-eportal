const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');


// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Dashboard  Get Function
router.get('/changepsswd/:_id',   (req, res) => {
    const id = req.params._id;

    res.render(`changepsswd`, {user: req.user })

  })

router.put('/changepsswd/:_id/update', async (req, res) => {
  const id = req.params._id;
  const { old_password, new_password, confirm_password} = req.body;
    let errors = [];

    if (!old_password || !new_password || !confirm_password) {
      req.flash('error_msg', 'Please enter all fields ')
      errors.push({ msg: 'Please enter all fields' });

    }

    if (new_password != confirm_password) {
      errors.push({ msg: 'Passwords do not match' });
      req.flash('error_msg', 'Passwords do not match')
    }

    const newPasswd = new_password;

    User.findOne({_id: id}, async function (_err, info) {
      console.log(info.password)
      if (info == null) {
        req.flash('error_msg', 'Cannot find user.');
      } 
      try {
        if (await bcrypt.compare(old_password, info.password)) {
          const isValidPassword =  await bcrypt.compare(old_password, info.password);
          const hash = await bcrypt.hash(newPasswd, 10);
          console.log(`New Password: ${hash}`);
          const resetPassword = await User.findOneAndUpdate({_id: id}, {
            password: hash
          })
          req.flash('success_msg', 'Your password has been reset.');
          res.redirect(`/changepsswd/${id}`);
        } else {
          req.flash('error_msg', ' Old password incorrect.');
          errors.push({ msg: 'Passwords do not match' });
          console.log('Not allowed')
          res.redirect(`/changepsswd/${id}`)
        }
      } catch {
        req.flash('error_msg', ' Old password incorrect.');
      }
 
    })
})






module.exports = router;