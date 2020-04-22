const express = require('express');
const sqlite3 = require('sqlite3');

const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Menu';
    db.all(sql, (err, menus) => {
        if (err) {
            next(err);
        } else {
            res.send({menus: menus});
        }
    });
});

module.exports = menusRouter;