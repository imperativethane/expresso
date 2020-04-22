const express = require('express');
const sqlite3 = require('sqlite3');

const menuItemsRouter = express.Router({mergeParams: true});
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE id = $menuItemId';
    const values = {$menuItemId: menuItemId};

    db.get(sql, values, (err, menuItem) => {
        if (err) {
            next(err);
        } else if (!menuItem) {
            res.sendStatus(404);
        } else {
            req.menuItem = menuItem;
            next();
        }
    });
});

menuItemsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId';
    const values = {$menuId: req.params.menuId};

    db.all(sql, values, (err, menuItems) => {
        if (err) {
            next(err);
        } else {
            res.send({menuItems: menuItems});
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if (!name || !description || !inventory || !price) {
        res.sendStatus(400);
    };

    const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) ' +
    'VALUES ($name, $description, $inventory, $price, $menuId)';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            const sql = `SELECT * FROM MenuItem WHERE id = ${this.lastID}`;
            db.get(sql, (err, menuItem) => {
                res.status(201).send({menuItem: menuItem});
            });
        }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if (!name || !description || !inventory || !price) {
        res.sendStatus(400);
    };

    const sql = 'UPDATE MenuItem ' +
    'SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId ' +
    'WHERE id = $menuItemId'
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId,
        $menuItemId: req.params.menuItemId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            const sql = `SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`;
            db.get(sql, (err, menuItem) => {
                res.send({menuItem: menuItem});
            });
        }
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const sql = 'DELETE FROM MenuItem WHERE id = $menuItemId';
    const values = {$menuItemId: req.params.menuItemId};

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = menuItemsRouter;