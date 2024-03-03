const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const empProfileInfo = require('../models/empprofile');
const User = require('../models/User')
const methodOverride = require('method-override');

const empProfileController = require('../controller/empprofiles');
// const leaveInfo = require('../models/leaveform');

// Use for PATCH method 
router.use(methodOverride('_method'))

// To get the user collection info   //  empProfileController.empProfile_getInfo is point to the controller file, it will make it simple and clean
router.get('/empprofiles/info/:_id', ensureAuthenticated, empProfileController.empProfile_getInfo)



// Upload the EmployeeProfile into mongoDB
router.post('/empprofiles/info/upload/:_id', ensureAuthenticated, (req, res) => {
  const id = req.params._id;
  User.exists({ _id: id }, function (_err, infos) {
    if (infos === true) {
      empProfileInfo.exists({ userID: id }, function (err, info) {
        if (info === true) {
          // res.redirect(`/empprofiles/info/${id}`);
          req.flash('error_msg', 'Unable to resubmit with the same userID. Please change the info and submit again. ')
        } else {
          const empinfo = new empProfileInfo({
            // firstName: req.body.firstName,
            // name: req.body.name,
            // empNo: req.body.empNo,
            gender: req.body.gender,
            dateOfBirth: req.body.dateOfBirth,
            department: req.body.department,
            jobTitle: req.body.jobTitle,
            approver: req.body.approver,
            leaveEntitlement: req.body.leaveEntitlement,
            leaveBalance: req.body.leaveBalance,
            userID: req.params._id // User model User._id
          });
          empinfo.save().then(doc => {
            req.flash('success_msg', 'Successfully to submit Employee Info.');
            console.log(doc);
            res.redirect(`/empprofiles/info/${id}`);
            
          })
            .catch(_err => {
              console.error(_err);
            });
        }
      });
    } else {
      req.flash('error_msg', 'Invalid ID. Please contact Administrator.')
      console.log("Invalid ID. Please contact Administrator.");
    }
  })
});

// Update empployee profile
router.put('/empprofiles/info/:_id/edit', ensureAuthenticated, async (req, res, next) => {
  const id = req.params._id;
    const empDetail = await empProfileInfo.findOneAndUpdate({userID: id}, {
    // name: req.body.name,
    // empNo: req.body.empNo,
    gender: req.body.gender,
    // email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    // department: req.body.department,
    jobTitle: req.body.jobTitle,
    approver: req.body.approver,
    leaveEntitlement: req.body.leaveEntitlement,
    leaveBalance: req.body.leaveBalance
  },
  {new: true}).then(result => {
    if (!result){
      req.flash('error_msg', "Error! Unable to update")
    } else {
      console.log('Successfully Updated.')
      req.flash('success_msg', 'Successfully Updated');
      res.redirect(`/empprofiles/info/${id}`)
    } 
  })
  next();
});


// Update empployee profile topbar edit profile
router.put('/empprofiles/profile/:_id/edit', ensureAuthenticated, async (req, res, next) => {
  const id = req.params._id;
    const usrDetail = await User.findOneAndUpdate({_id: id}, {
    name: req.body.name,
    empNo: req.body.empNo,
    department: req.body.department,

  }, 
  {new: true}).then(result => {
    if (!result){
      req.flash('error_msg', "Error! Unable to update")
    } else {
      console.log("Profile:  Successfully Updated.")
      req.flash('success_msg', 'Successfully Updated');
      res.redirect(`/empprofiles/info/${id}`)
    } 
  })
  next();
});




module.exports = router;