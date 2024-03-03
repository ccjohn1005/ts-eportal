const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth'); //权限：如果没有登入的话，是无法跳转到这个页面，成功登入的话才可以跳转这个页面
// const memoDetails = require('../models/uploadfile');

// Welcome Page , change to login page
router.get('/', forwardAuthenticated, (req, res) => res.render('login'));



module.exports = router;
