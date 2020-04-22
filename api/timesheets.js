const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = 'SELECT * FROM Timesheet WHERE id = $timesheetId';
    const values = {$timesheetId: timesheetId};

    db.get(sql, values, (err, timesheet) => {
        if (err) {
            next(err);
        } else if (!timesheet) {
            res.sendStatus(404);
        } else {
            req.timesheet = timesheet;
            next();
        }
    });
});

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

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if (!hours || !rate || !date) {
        res.sendStatus(400);
    };

    const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) ' +
    'VALUES ($hours, $rate, $date, $employeeId)';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date, 
        $employeeId: req.params.employeeId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            const sql = `SELECT * FROM Timesheet WHERE id = ${this.lastID}`;
            db.get(sql, (err, timesheet) => {
                res.status(201).send({timesheet: timesheet});
            });
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if (!hours || !rate || !date) {
        res.sendStatus(400);
    };

    const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId ' +
    'WHERE id = $timesheetId';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date, 
        $employeeId: req.params.employeeId,
        $timesheetId: req.params.timesheetId
    };

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            const sql = `SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`;
            db.get(sql, (err, timesheet) => {
                res.send({timesheet: timesheet});
            });
        }
    });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const sql = 'DELETE FROM Timesheet WHERE id = $timesheetId';
    const values = {$timesheetId: req.params.timesheetId};

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = timesheetsRouter;