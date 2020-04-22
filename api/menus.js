const express = require('express');
const sqlite3 = require('sqlite3');

const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE id = $menuId';
    const values = {$menuId: menuId};

    db.get(sql, values, (err, menu) => {
        if (err) {
            next(err);
        } else if (!menu) {
            res.sendStatus(404);
        } else {
            req.menu = menu;
            next();
        }
    });
});

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

menusRouter.get('/:menuId', (req, res, next) => {
    res.send({menu: req.menu});
});

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;

    if (!title) {
        res.sendStatus(400);
    };

    const sql = 'INSERT INTO Menu (title) ' +
    'VALUES ($title)';
    const values = {$title: title};

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            const sql = `SELECT * FROM Menu WHERE id = ${this.lastID}`;
            db.get(sql, (err, menu) => {
                res.status(201).send({menu: menu});
            });
        }
    });
});

module.exports = menusRouter;