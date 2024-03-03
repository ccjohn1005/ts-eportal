const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const multer = require('multer');
const memoDetails = require('../models/uploadfile');
const methodOverride = require('method-override');
const fs = require('fs');
const path = require('path');

// Use for PATCH method 
router.use(methodOverride('_method'))



// Set The Storage Engine, using multer to save the upload file into localstorage
const storages = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
  // path: function (req, file, cb){
  //   cb(null, 'users' + file.destination + file.filename)
  // }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(req.flash('error', 'Warning! Only support PDF format.'), false);

  }
};


// Init Upload
const upload = multer({
  storage: storages,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: fileFilter
}).single('myMemo');

router.post('/upload', ensureAuthenticated, async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      req.flash('error_msg', 'Warning! The file cannot exceed 10MB. ');
      res.redirect('/memo');
    } else {
      const files = new memoDetails({
        title: req.body.titleName,
        newFileName: req.file.filename,
        desc: req.body.contentMemo
      });

      // added async and const savedFiles with await
      const savedFiles = await files.save().then(doc => {
        req.flash('success_msg', 'Successfully to created new memo.');
        console.log(req.file);
        res.redirect('/memo');
      });


    }
    next();
  })
});




router.get('/memo', ensureAuthenticated, (req, res) => {
  memoDetails.find({}, function (err, info) {
    renderResult(res, info, req);
  });
});


function renderResult(res, info, req) {
  res.render('memo.ejs', { memo: info, user: req.user }, //可以render 多个object 去ejs 
    function (err, result) {
      if (!err) {
        res.end(result);
      } else {
        res.end('Warning! An error occurred. Please check the memo function and Object properties.');
        console.log(err);
      }
    });
}


// Update the titleName into mongoDB
router.put('/memo/:_id/edit', ensureAuthenticated, upload, async (req, res, next) => {
  const id = req.params;
  const updateMemo = await memoDetails.findByIdAndUpdate(id, { title: req.body.titleName, desc: req.body.contentMemo, newFileName: req.file.filename }, { new: true })
    .then(result => {
      if (!result) {
        req.flash('error_msg', "Error! Unable to update")
        res.redirect('/memo');
      } else {
        req.flash('success_msg', 'Successfully Updated');
        res.redirect('/memo');
      }
    });
  next();
});


// Delete the Memo Details
router.delete('/memo/:_id/delete', ensureAuthenticated, async (req, res) => {
  const getMemo = await memoDetails.findById(req.params._id, 'newFileName')

  function deleteFile(url, name) {
    var files = [];

    if (fs.existsSync(url)) {    //判断给定的路径是否存在

      files = fs.readdirSync(url);    //返回文件和子目录的数组

      files.forEach(function (file, index) {

        var curPath = path.join(url, file);

        if (fs.statSync(curPath).isDirectory()) { //同步读取文件夹文件，如果是文件夹，则函数回调
          deleteFile(curPath, name);
        } else {

          if (file.indexOf(name) > -1) {    //是指定文件，则删除
            fs.unlinkSync(curPath);
            console.log("Deleted File：" + curPath);
          }
        }
      });
    } else {
      console.log("The path you given is not valid. Please check");
    }

  }
  deleteFile('public/uploads/', getMemo.newFileName)

  const delMemo = await memoDetails.findByIdAndDelete(req.params._id)
    .then(delResult => {
      if (!delResult) {
        req.flash('error_msg', 'Error! Unable to delete.')
      } else {
        req.flash('error_msg', 'Successfully Deleted')
        res.redirect('/memo')
      }
    })
});






module.exports = router;






/*
Note:
- CLick the upload button,
  it will auto add the modal and the column for the title will based on the user input to display the title.
- Try using AJAX to avoid fter the file need to refresh the page again.

Minor
- Upload progress-bar
*/