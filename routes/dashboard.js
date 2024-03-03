const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth'); //权限：如果没有登入的话，是无法跳转到这个页面，成功登入的话才可以跳转这个页面
const leaveInfo = require('../models/leaveform');
const memoDetails = require('../models/uploadfile');


// Dashboard  Get Function
router.get('/users/dashboard', ensureAuthenticated, async (req, res) => {
  const memoDetail = await memoDetails.find({}, function (err, info) {
    let currentDate = new Date();
    let date = new Date();

    date.setDate(date.getDate() + 15)
    currentDate.setDate(currentDate.getDate() - 1)
    
    if (err) {
      console.log(err);
    } else {
      leaveInfo.find({
        toDate: {
          $gte: currentDate, $lte: date
        }
      }, function (err, leaveData) {
        if (err) {
          console.log(err);
        }  else {
          res.render('dashboard', {
            memo: info,
            user: req.user,
            leaveDataInfo: leaveData
          })
        }
      }).sort({"fromDate": 1})
    }
  })

})

  module.exports = router;
