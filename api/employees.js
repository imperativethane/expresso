const express = require('express');
const sqlite3 = require('sqlite3');

const employeesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    const sql = 'SELECT * FROM Employee WHERE id = $employeeId';
    const values = {$employeeId: employeeId};

    db.get(sql, values, (err, employee) => {
        if (err) {
            next(err);
        } else if (!employee) {
            res.sendStatus(404);
        } else {
            req.employee = employee;
            next();
        }
    });
});

employeesRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1';
    db.all(sql, (err, employees) => {
        if (err) {
            next(err);
        } else {
            res.send({employees: employees});
        }
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.send({employee: req.employee});
});

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

    if (!name || !position || !wage) {
        res.sendStatus(400);
    };

    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) ' + 
    'VALUES ($name, $position, $wage, $isCurrentEmployee)';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    };

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            const sql = `SELECT * FROM Employee WHERE id = ${this.lastID}`;
            db.get(sql, (err, employee) => {
                res.status(201).send({employee: employee});
            });
        }
    });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

    if (!name || !position || !wage) {
        res.sendStatus(400);
    };
    
    const sql = 'UPDATE Employee ' +
    'SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee ' +
    'WHERE id = $employeeId';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId
    };
    
    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            const sql = `SELECT * FROM Employee WHERE id = ${req.params.employeeId}`;
            db.get(sql, (err, employee) => {
                res.send({employee: employee});
            });
        }
    });
});

module.exports = employeesRouter;