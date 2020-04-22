const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Timesheet WHERE employee_id = $employeeId';
    const values = {$employeeId: req.params.employeeId};

    db.all(sql, values, (err, timesheets) => {
        if (err) {
            next(err);
        } else {
            res.send({timesheets: timesheets});
        }
    });
});

module.exports = timesheetsRouter;