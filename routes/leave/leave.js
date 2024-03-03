const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../config/auth");
const leaveInfo = require("../../models/leaveform");
const User = require("../../models/User");
const empProfileInfo = require("../../models/empprofile");
const methodOverride = require("method-override");
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const test = require("../../controller/nodeMailer")


require('dotenv').config()

// Use for PATCH/ PUT method 
router.use(methodOverride('_method'));

router.get("/leave/leaveform", ensureAuthenticated, async (req, res, next) => {
    const id = req.params._id;

    await empProfileInfo
      .find({})
      .populate("userID")
      .exec(function (err, info) {
        if (err) {
          console.log(err);
        } else {
          leaveInfo
          .find({}).sort({"fromDate": -1} )
          .populate("userID")
          .exec(function (err, leaveData) {
           if (err){
             console.log(err);
           } else {
            User
            .find({})
            .exec(function (err, userInfo) {
              res.render('leave/leaveform',{
                empinfo: info,
                user: req.user,
                leaveDataInfo: leaveData,
                userData: userInfo
              });
            })

           }
          });
      }
    });
});


// Upload the leaveform into mongoDB    (change the CC email address)
// 强制把没有在在三天前的leave 申请的，转去EL or MC or UL and then hide the annual leave option 
// Write a condition on POST submit to check the EL Date before submit 
router.post("/leaveform/submit/:_id", ensureAuthenticated, async (req, res, next) => {
  const id = req.params._id;
  const findUser = await User.findById({_id: id})

  const leave = new leaveInfo({
    fullName: findUser.name,
    department: findUser.department,
    empNo: findUser.empNo,
    email: findUser.email,
    leavecat: req.body.leavecat,
    fromDate: req.body.fromDate,
    toDate: req.body.toDate,
    day: req.body.day,
    timetype: req.body.timetype,
    reason: req.body.reason,
    approver: req.body.approver,
    userID: req.params._id
  });
  
  //  Only display latest 7 days leave records  
  /*
    如果说fromdate - 3 天不等于 today date 就变成EL ，在你申请AL 的情况下才会实现

    然后如果是EL 就会在emprofileinfo.counterEL 减1次
    Note: 旧date 是小过新date
  */
  let subDate = new Date(); // 拿今天的日期
  let leaveFromDate = leave.fromDate;
  subDate.setDate(subDate.getDate())
  // let subDateDay = subDate.getDay(); // Day (of the week)
  let subDateDate = subDate.getDate(); // Day (of the month)
  let subDateMonth = subDate.getMonth();

  // let leaveFromDateDay = leaveFromDate.getDay(); // Day (of the week)
  let leaveFromDateDate = leaveFromDate.getDate(); // Day (of the month)
  let leaveFromDateMonth = leaveFromDate.getMonth();
  let leaveFromDate3 = leaveFromDateDate - 3;
  let leaveFromDate2 = leaveFromDateDate - 2;
  let leaveFromDate1 = leaveFromDateDate - 1;

  if ( ( (leaveFromDate3 < subDateDate && leaveFromDateMonth < subDateMonth ) // this condition correct
  || ( leaveFromDateDate === subDateDate && leaveFromDateMonth === subDateMonth ) // this condition correct
  || ( leaveFromDate2 === subDateDate && leaveFromDateMonth === subDateMonth  ) // this condition correct
  || ( leaveFromDate1 === subDateDate && leaveFromDateMonth === subDateMonth  ) // this condition correct
  || ( leaveFromDateDate < subDateDate && leaveFromDateMonth < subDateMonth 
  || leaveFromDateDate < subDateDate && leaveFromDateMonth === subDateMonth  ) ) // this condition correct 
    && (leave.leavecat != "Medical Leave (MC)" 
    && leave.leavecat != "Unpaid Leave (UL)" ) )  { // this condition correct
    // const deductEL = await empProfileInfo.findOneAndUpdate({"userID": id}, {"counterEL": { "$inc": -1}});
    
    const leave1 = new leaveInfo({
      fullName: findUser.name,
      department: findUser.department,
      empNo: findUser.empNo,
      email: findUser.email,
      leavecat: "Emergency Leave (EL)",
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      day: req.body.day,
      timetype: req.body.timetype,
      reason: req.body.reason,
      approver: req.body.approver,
      userID: req.params._id,
    });

    // added async and const savedFiles with await
    const savedFiles = await leave1
    .save()
    .then((doc) => {
      req.flash(
        "success_msg",
        "Leave request was successfully submitted. Please wait for the approval."
      );
      console.log(`${findUser.name} is taking EL ${new Date().toString()}` )
      console.log(doc);
      res.redirect(`/leave/leaveform`);
    })
    .catch((err) => {
      console.error(err);
      req.flash(
        "error_msg",
        "Error! Leave failed to submitted. Please contact the administrator. "
      );
      console.log(`Error occurs from ${findUser.name}. Module submit leave (POST). DateTime: ${new Date().toString()}`);
    });

  } else {

    const leave1 = new leaveInfo({
      fullName: findUser.name,
      department: findUser.department,
      empNo: findUser.empNo,
      email: findUser.email,
      leavecat: "Annual Leave (AL)",
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      day: req.body.day,
      timetype: req.body.timetype,
      reason: req.body.reason,
      approver: req.body.approver,
      userID: req.params._id,
    });


    // added async and const savedFiles with await
    const savedFiles = await leave1
    .save()
    .then((doc) => {
      req.flash(
        "success_msg",
        "Leave request was successfully submitted. Please wait for the approval."
      );
      console.log(`${findUser.name} is taking (AL) ${new Date().toString()}`)
      console.log(doc);
      res.redirect(`/leave/leaveform`);
    })
    .catch((err) => {
      console.error(err);
      req.flash(
        "error_msg",
        "Error! Leave failed to submitted. Please contact the administrator. "
      );
      console.log(`Error occurs from ${findUser.name}. Module submit leave (POST). DateTime: ${new Date().toString()}`);
    });
  }

  // const transporter = nodemailer.createTransport({
  //   host: `${process.env.host}`,
  //   port: `${process.env.emailPORT}`,
  //   secure: false,
  //   auth: {
  //     user: `${process.env.user}`,
  //     pass: `${process.env.password}`,
  //   },
  // });

  // const mailOptions = {
  //   from: `${process.env.user}`,
  //   // "to" 这里已经做了filter 在 leaveform.ejs ，每一个approver 必须填empprofile form 才可以show list 出来
  //   to: `${req.body.approver}`, // to approver
  //   cc: `${findUser.email}`, // cc to requestor
  //   subject: `Leave Request`,
  //   // html: ` ${findUser.name} apply leave on <b><i>${req.body.fromDate}</b></i> to <b><i>${req.body.toDate}</b></i> (Day: <b>${req.body.day}</b>. Time Types: <b>${req.body.timetype}</b> ).<br> Reason: ${req.body.reason} `,
  //   html: `Hello, <br> The leave request was submitted by <b>${findUser.name}</b>. <br>
  //   <br> Leave Details:- <br> From: <b><i>${req.body.fromDate}</b></i> <br> To: <b><i>${req.body.toDate}</b></i> <br>Day: <b><i>${req.body.day}</b></i> <br> Time Type: <b><i>${req.body.timetype}</b></i> <br> Reason: ${req.body.reason}`,
  // };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(`DateTime: ${new Date().toString()} . ${error} ` );
  //   } else {
  //     console.log("Email sent: " + info.response + ' ' + new Date().toString());
  //   }
  // });

  next();
});

// Update the leaveform into mongoDB
router.put("/leaveform/submit/:id/edit/:userID", ensureAuthenticated, async (req, res, next) => {
  const id = req.params.id
  const findstaff = await leaveInfo.findById(id);
  const userID = req.params.userID;
  const findUser = await User.findById({_id: userID})

  const leaveDetails = await leaveInfo.findOneAndUpdate({_id: id}, {
    status: "Pending",
    leavecat: req.body.leavecat, // 如果已经approved 的leave， edit 过后status still approved 。可是
    fromDate: req.body.fromDate2,
    toDate: req.body.toDate2,
    day: req.body.day,
    timetype: req.body.timetype,
    reason: req.body.reason,
    updateDate: new Date()
  },{new: true}).then(result => {
    if (!result){
      req.flash('error_msg', "Error! Leave failed to updated. Please contact the administrator.")
    } else {
      console.log(result)
      console.log(`${findstaff.fullName} Leave record was successfully updated. DateTime: ${new Date().toString()}` )
      req.flash('success_msg', 'Leave record was successfully updated.');
      res.redirect(`/leave/leaveform`)
    } 
  })
  

  // const transporter = nodemailer.createTransport({
  //   host: `${process.env.host}`,
  //   port: `${process.env.emailPORT}`,
  //   secure: false,
  //   auth: {
  //     user: `${process.env.user}`,
  //     pass: `${process.env.password}`,
  //   },
  // });

  // const mailOptions = {
  //   from: `${process.env.user}`,
  //   // "to" 这里已经做了filter 在 leaveform.ejs ，每一个approver 必须填empprofile form 才可以show list 出来
  //   to: `${req.body.approver} `, // to approver
  //   cc: `${findstaff.email}`,  // cc to requestor
  //   subject: `Leave Amendement`,
  //   html: `${findstaff.fullName} apply <b>${req.body.leavecat}</b> on <b><i>${req.body.fromDate2}</b></i> to <b><i>${req.body.toDate2}</b></i> (Day: <b><i>${req.body.day}</b></i>. Time Type: <b><i>${req.body.timetype}</b></i>).<br> Reason: ${req.body.reason}`,
  // };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(`DateTime: ${new Date().toString()} . ${error} ` );
  //   } else {
  //     console.log("Email sent: " + info.response + ' ' + new Date().toString());
  //   }
  // });

  next();
});


// Leave Amendment (HR) TAB into mongoDB (EDIT)
router.put("/leaveform/submit/:id/hraamendment/:userID", ensureAuthenticated, async (req, res, next) => {
  const id = req.params.id
  const findstaff = await leaveInfo.findById(id);
  const userID = req.params.userID;
  const findUser = await User.findById({_id: userID})

  // if (id != findstaff.userID) {

  const leaveDetails = await leaveInfo.findOneAndUpdate({_id: id}, {
    leavecat: req.body.leavecat1, // 如果已经approved 的leave， edit 过后status still approved 。可是
    fromDate: req.body.fromDate3,
    toDate: req.body.toDate3,
    day: req.body.day1,
    timetype: req.body.timetype1,
    updateDate: new Date(),
    updateBy: findUser.name
  },{new: true}).then(result => {
    if (!result){
      req.flash('error_msg', "Error! Leave failed to updated. Please contact the administrator. ")
    } else {
      console.log(result)
      console.log(`${findstaff.fullName} Leave record was successfully updated by HR Dept - ${findUser.name}. DateTime: ${new Date().toString()}` )
      req.flash('success_msg', 'Leave record was successfully Updated');
      res.redirect(`/leave/leaveform`)
    } 
  })


  // const transporter = nodemailer.createTransport({
  //   host: `${process.env.host}`,
  //   port: `${process.env.emailPORT}`,
  //   secure: false,
  //   auth: {
  //     user: `${process.env.user}`,
  //     pass: `${process.env.password}`,
  //   },
  // });

  // const mailOptions = {
  //   from: `${process.env.user}`,
  //   // "to" 这里已经做了filter 在 leaveform.ejs ，每一个approver 必须填empprofile form 才可以show list 出来
  //   to: `${findstaff.email}`, // to the leave owner
  //   cc: `${findUser.email}`, // cc to who update the leave
  //   subject: `Leave Amendement By HR Dept`,
  //   // text: `${findstaff.fullName} apply ${req.body.leavecat} on ${req.body.fromDate2} to ${req.body.toDate2} (Day: ${req.body.day}). Reason: ${req.body.reason}`,
  //   html: `Dear ${findstaff.fullName}, <br> Your leave record was successfully updated by <b>${findUser.name}</b> <br>  
  //  <br> Leave Details:- <br> Leave Category: <b>${req.body.leavecat1}</b>  <br> From: <b><i>${req.body.fromDate3}</b></i> <br> To: <b><i>${req.body.toDate3}</b></i><br>Day: <b><i>${req.body.day1}</b></i> 
  //  <br> Time Type: <b><i>${req.body.timetype1}</b></i>`

  
  // };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(`DateTime: ${new Date().toString()} . ${error} ` );
  //   } else {
  //     console.log("Email sent: " + info.response + ' ' + new Date().toString());
  //   }
  // });
  // } else {
  //   console.log(`${findUser.name} trying to update own leave record. DateTime: ${new Date().toString()}` )
  //   req.flash('error_msg', 'You have no permission to update your own leave application.');
  // }

  next();
});


// Withdraw the leave by Employee
// 现在全部withdraw 的leave 都会直接删掉 不作任何记录 22-08-2022
router.delete('/leaveform/submit/:id/withdraw/:userID', ensureAuthenticated, async (req, res, next) => {
  const id = req.params.id;
  const findstaff = await leaveInfo.findById(id);
  const userID = req.params.userID;
  const findUser = await User.findById({_id: userID})


  const leaveDetails = await leaveInfo.findOneAndDelete({_id: id})
  .then(result => {
    if (!result){
      req.flash('error_msg', "Error! Leave failed to updated. Please contact the administrator")
    } else {
      console.log(`Leave was deleted on DateTime: ${new Date().toString()}: ${result}   Successfully Withdrew.`)
      req.flash('success_msg', `Leave was successfully withdrew. `);
      res.redirect(`/leave/leaveform`);
    } 
  });
  

    // const transporter = nodemailer.createTransport({
    //   host: `${process.env.host}`,
    //   port: `${process.env.emailPORT}`,
    //   secure: false,
    //   auth: {
    //     user: `${process.env.user}`,
    //     pass: `${process.env.password}`,
    //   },
    // });
  
    // const mailOptions = {
    //   from: `${process.env.user}`,
    //   // "to" 这里已经做了filter 在 leaveform.ejs ，每一个approver 必须填empprofile form 才可以show list 出来
    //   to: `${findstaff.approver} `, // to approver
    //   cc:  `${findUser.email}`,  // cc to requestor
    //   subject: `Cancellation of Leave`,
    //   html: `${findstaff.fullName} would like to cancel <b>${findstaff.leavecat}</b> on <b><i>${findstaff.fromDate.toDateString()}</b></i> to <b><i>${findstaff.toDate.toDateString()}</b></i> (Day: <b>${findstaff.day}.</b> Time Type: <b>${findstaff.timetype}</b> ).<br>`,
    // };
  
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.log(`DateTime: ${new Date().toString()} . ${error} ` );
    //   } else {
    //     console.log("Email sent: " + info.response + ' ' + new Date().toString());
    //   }
    // });

    next();
  });

// Withdraw the leave by HR 
router.delete('/leaveform/submit/:id/hrwithdraw/:userID', ensureAuthenticated, async (req, res, next) => {
  const id = req.params.id;
  const findstaff = await leaveInfo.findById(id);
  const userID = req.params.userID;
  const findUser = await User.findById({_id: userID})


  const leaveDetails = await leaveInfo.findOneAndDelete({_id: id})
  .then(result => {
    if (!result){
      req.flash('error_msg', "Error! Leave failed to updated. Please contact the administrator")
    } else {
      console.log(`Leave was deleted on DateTime: ${new Date().toString()}: ${result}   Successfully Withdrew By (HR).`)
      req.flash('success_msg', `Leave was successfully withdrew.`);
      res.redirect(`/leave/leaveform`);
    } 
  });
  
    // const transporter = nodemailer.createTransport({
    //   host: `${process.env.host}`,
    //   port: `${process.env.emailPORT}`,
    //   secure: false,
    //   auth: {
    //     user: `${process.env.user}`,
    //     pass: `${process.env.password}`,
    //   },
    // });

    // const mailOptions = {
    //   from: `${process.env.user}`,
    //   to: `${findstaff.email} `, // to the leave owner
    //   cc:  `${findUser.email}, ${findstaff.approver}`,  // cc to who delete the leave
    //   subject: `Cancellation of Leave`,
    //   html: `${findstaff.fullName} would like to cancel <b>${findstaff.leavecat}</b> on <b><i>${findstaff.fromDate.toDateString()}</b></i> to <b><i>${findstaff.toDate.toDateString()}</b></i> (Day: ${findstaff.day}</b></i>. Time Type: <b><i>${findstaff.timetype}</b></i>).`
    // };
  
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.log(`DateTime: ${new Date().toString()} . ${error} ` );
    //   } else {
    //     console.log("Email sent: " + info.response + ' ' + new Date().toString());
    //   }
    // });

    next();
  });

  

// Approve the leave application 
router.put("/leaveform/submit/:id/approve/:userID",  ensureAuthenticated, async (req, res, next) => {
  // Leave record ID
  const id = req.params.id; 
  console.log(id);
  const findstaff = await leaveInfo.findById(id);
  if (findstaff) {
    console.log(`Find Staff: ${findstaff.fullName}`)
  } else {
    res.status(404).json({message: 'Staff ID not found'})
  }

  // Current UserID.. To find the approval person name
  const userID = req.params.userID;
  const findUser = await User.findOne({_id: userID});
  if (findUser) {
    console.log(`Find Approval Person ID: ${findUser.name}`)
  } else {
    res.status(404).json({message: 'Approval ID not found'})
  }
  
  if (findstaff.status === "Pending" && findUser.isApprover === true ) { /* here is check the user account must be admin and (the findstaff = leaveInfo) check the leave status must be Pending  */
    if ((findstaff.userID.toString() === userID.toString() || findUser.isApprover === false) /*|| findstaff.department != findUser.department*/) {
      console.log("Error! You have no permission to approve your the leave application.")
      req.flash('error_msg', "You have no permission to approve your the leave application.")
      res.redirect(`/leave/leaveform`)
    } else {
    const leaveDetails = await leaveInfo.findOneAndUpdate({_id: id}, {
      status: "Approved",
      actionBy: findUser.name,
      approvedDate: new Date()
    },{new: true}).then(result => {
      if (!result){
        req.flash('error_msg', "Error! Leave failed to updated. Please contact the administrator")
      } else {
        console.log(result)
        console.log(`${findstaff.fullName} Leave record was successfully approved. DateTime: ${new Date().toString()}` )
        req.flash('success_msg', `Leave was successfully approved`);
        res.redirect(`/leave/leaveform`)
      } 
    })

  // const transporter = nodemailer.createTransport({
  //   host: `${process.env.host}`,
  //   port: `${process.env.emailPORT}`,
  //   secure: false,
  //   auth: {
  //     user: `${process.env.user}`,
  //     pass: `${process.env.password}`,
  //   },
  // });

  // const mailOptions = {
  //   from: `${process.env.user}`,
  //   // "to" 这里已经做了filter 在 leaveform.ejs ，每一个approver 必须填empprofile form 才可以show list 出来
  //   to: `${findstaff.email}`, // findstaff.email is requestor email, findUser.email is approver
  //   cc: `hra@tekseng.co, ${findUser.email}`, 
  //   subject: `Leave Approved`,
  //   html: `Dear ${findstaff.fullName}, <br> Your leave application has been approved by ${findUser.name}. <br><br>
  //   <br> Leave Details:- <br> Leave Category: <b>${findstaff.leavecat}</b> <br> From: <b><i>${findstaff.fromDate.toDateString()}</b></i> <br> To: <b><i>${findstaff.toDate.toDateString()}</b></i> <br>Day: <b><i>${findstaff.day}</b></i> <br> Time Type: <b><i>${findstaff.timetype}</b></i> <br> Reason: ${findstaff.reason}`,
  // };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(`DateTime: ${new Date().toString()} . ${error} ` );
  //   } else {
  //     console.log("Email sent: " + info.response + ' ' + new Date().toString());
  //   }
  // });
  } 
  } else {
    req.flash('error_msg', "Error! Please submit new leave application or contact administrator.")
    res.redirect(`/leave/leaveform`)

  }
  
  next();

});

// Decline the leave application 
router.put("/leaveform/submit/:id/decline/:userID", ensureAuthenticated, async (req, res, next) => {
  const id = req.params.id;
  const findstaff = await leaveInfo.findById(id);
  const userID = req.params.userID;
  const findUser = await User.findOne({_id: userID});


  if (findstaff.status === "Pending") {
    if (findstaff.userID.toString() === userID.toString() || findUser.isApprover === false ) {
      console.log("Error: You have no permission to decline your the leave application.")
      req.flash('error_msg', "You have no permission to decline your the leave application.")
      res.redirect(`/leave/leaveform`)
    } else {
    const leaveDetails = await leaveInfo.findOneAndUpdate({_id: id}, {
      status: "Declined",
      actionBy: findUser.name,
      approvedDate: new Date()
    },{new: true}).then(result => {
      if (!result){
        req.flash('error_msg', "Error! Leave failed to updated. Please contact the administrator")
      } else {
        console.log(`${findstaff.fullName} Leave record was successfully declined. DateTime: ${new Date().toString()}` )
        console.log(result)
        req.flash('success_msg', 'Leave was successfully Declined');
        res.redirect(`/leave/leaveform`)
      } 
    })
 
  // const transporter = nodemailer.createTransport({
  //   host: `${process.env.host}`,
  //   port: `${process.env.emailPORT}`,
  //   secure: false,
  //   auth: {
  //     user: `${process.env.user}`,
  //     pass: `${process.env.password}`,
  //   },
  // });

  // const mailOptions = {
  //   from: `${process.env.user}`,
  //   // "to" 这里已经做了filter 在 leaveform.ejs ，每一个approver 必须填empprofile form 才可以show list 出来
  //   to: `${findstaff.email}, ${findUser.email}`, // findstaff.email is requestor email, findUser.email is approver
  //   subject: `Leave Declined`,
  //   html: `Dear ${findstaff.fullName}, Your leave application has been declined by ${findUser.name}. <br> Leave Details: ${findstaff.fromDate.toDateString()}</b></i> to <b><i>${findstaff.toDate.toDateString()}</b></i> (Day: <b><i>${findstaff.day}</b></i>. Time Type: <b><i>${findstaff.timetype}</b></i>)..<br> Reason: ${findstaff.reason}`,
  // };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(`DateTime: ${new Date().toString()} . ${error} ` );
  //   } else {
  //     console.log("Email sent: " + info.response + ' ' + new Date().toString());
  //   }
  // });
}
} else {
  req.flash('error_msg', "Please submit new leave application or contact administrator.")
  res.redirect(`/leave/leaveform`)
}
  next();
});


module.exports = router;
