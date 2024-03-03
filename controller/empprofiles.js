const empProfileInfo = require('../models/empprofile');
const leaveInfo = require('../models/leaveform');

exports.empProfile_getInfo = async (req, res) => {
    const id = req.params._id;
    const empDetail = await empProfileInfo.find({userID: id}, function (err, info){
          res.render('empprofiles/info', { empinfo: info, user: req.user }) 
    }) 





  }