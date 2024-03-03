const express = require('express');
const router = express.Router();


router.get('/test', function (req, res) {
    const sql = require("mssql");
    // config for your database
    var config = {
        user: 'sa',
        password: 'Tsst123!',
        server: 'LIT-01\\SQLEXPRESS', 
        database: 'WangSaga',
        synchronize: true,
        trustServerCertificate: true,
    };
    // connect to your database
    sql.connect(config, function (err) {
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
        // query to the database and get the records
        request.query("select * from prLeaveBalD where EmpNo = 'wc1327' and LeaveYear = 2022", function (err, recordset) {
            if (err) console.log(err)
            // send records as a response
            res.send(recordset);
        });
    });
});


module.exports = router;