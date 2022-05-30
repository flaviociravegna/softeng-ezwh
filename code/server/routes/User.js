'use strict';

const express = require('express');
const router = express.Router();
const user_db = require('../modules/User');
const { check, validationResult, body } = require('express-validator'); // validation middleware
router.use(express.json());
const bcrypt = require('bcrypt');

function CheckifTypeValid(type) {
    let VALIDTYPES = ['customer', 'qualityEmployee', 'manager', 'deliveryEmployee', 'clerk', 'supplier'];
    return (VALIDTYPES.includes(type));
}

function CheckifTypeAllowed(type) {
    let VALIDTYPES = ['customer', 'qualityEmployee', 'deliveryEmployee', 'clerk', 'supplier'];
    return (VALIDTYPES.includes(type));
}

// Return an array containing all suppliers.
router.get('/api/suppliers', async (req, res) => {
    try {
        let suppliers = await user_db.getAllSuppliers();

        const suppliers_array = suppliers.map((row) => ({
            id: row.userId,
            name: row.name,
            surname: row.surname,
            email: row.username,
        }));

        res.json(suppliers_array);

    } catch (err) {
        res.status(500).end();
    }
});

// Return an array containing all users excluding managers
router.get('/api/users', async (req, res) => {
    try {
        let users = await user_db.getAllUsersExceptManagers();

        const users_array = users.map((row) => ({
            id: row.userId,
            name: row.name,
            surname: row.surname,
            email: row.username,
            type: row.type
        }));

        res.json(users_array);

    } catch (err) {
        res.status(500).end();
    }
});

// CREATE NEW USER
router.post('/api/newUser', [
    check('name').notEmpty().isString(),
    check('surname').notEmpty().isString(),
    check('username').notEmpty().isEmail(),
    check('type').custom(val => {
        return CheckifTypeAllowed(val);
    }),
    check('password').notEmpty().isString().isLength({ min: 8 }),
], async (request, response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty())
            return response.status(422).json({ errors: errors.array() });

        //check if user and type already exists
        const user = await user_db.getUserByUsernameAndType(request.body.username, request.body.type);
        if (user.length != 0)
            return response.status(409).json({ error: `Username ${request.body.username} of type ${request.body.type} already exist.` }); //username already exists

        // Set the id
        let max_id = await user_db.searchMaxID();
        if (max_id === null)
            max_id = 1;
        else
            max_id++;

        // Encrypt password
        const hash = await bcrypt.hash(request.body.password, 10);

        const new_user = {
            id: max_id,
            username: request.body.username,
            name: request.body.name,
            surname: request.body.surname,
            hash: hash,
            type: request.body.type,
        };

        await user_db.createNewUser(new_user);
        response.status(201).end();


    } catch (err) {
        response.status(503).end();
    }
});

// POST (login)
router.post('/api/managerSessions', async (req, res) => {
    try {
        const user = await user_db.getUserInfo(req.body.username, req.body.password);
        if (!user)
            res.status(401).json({ error: `wrong username and/or password` });
        res.json(user);
    } catch (err) {
        res.status(500).end();
    }
});

router.post('/api/customerSessions', async (req, res) => {
    try {
        const user = await user_db.getUserInfo(req.body.username, req.body.password);
        if (!user)
            res.status(401).json({ error: `wrong username and/or password` });
        res.json(user);
    } catch (err) {
        res.status(500).end();
    }
});

router.post('/api/supplierSessions', async (req, res) => {
    try {
        const user = await user_db.getUserInfo(req.body.username, req.body.password);
        if (!user)
            res.status(401).json({ error: `wrong username and/or password` });
        res.json(user);
    } catch (err) {
        res.status(500).end();
    }
});

router.post('/api/clerkSessions', async (req, res) => {
    try {
        const user = await user_db.getUserInfo(req.body.username, req.body.password);
        if (!user)
            res.status(401).json({ error: `wrong username and/or password` });
        res.json(user);
    } catch (err) {
        res.status(500).end();
    }
});

router.post('/api/qualityEmployeeSessions', async (req, res) => {
    try {
        const user = await user_db.getUserInfo(req.body.username, req.body.password);
        if (!user)
            res.status(401).json({ error: `wrong username and/or password` });
        res.json(user);
    } catch (err) {
        res.status(500).end();
    }
});

router.post('/api/deliveryEmployeeSessions', async (req, res) => {
    try {
        const user = await user_db.getUserInfo(req.body.username, req.body.password);
        if (!user)
            res.status(401).json({ error: `wrong username and/or password` });
        res.json(user);
    } catch (err) {
        res.status(500).end();
    }
});

// POST (logout)
router.post('/api/logout', (req, res) => {
    try {
        req.logout();
        res.end();
    } catch (err) {
        res.status(500).end();
    }
});


// MODIFY rights of a user, given its username
router.put('/api/users/:username', [
    check('username').isEmail(),
    check('oldType').custom(val => {
        return CheckifTypeAllowed(val);
    }),
    check('newType').custom(val => {
        return CheckifTypeAllowed(val);
    })
], async (req, res) => {
    try {
        // Check parameters
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).end();

        // Check if the User exists
        let user = await user_db.getUserByUsernameAndType(req.params.username, req.body.oldType);
        if (user.length == 0)
            return res.status(404).end(); //user not found

        // Check if the new user-rights exists
        let new_user = await user_db.getUserByUsernameAndType(req.params.username, req.body.newType);
        if (new_user.length != 0)
            return res.status(503).end(); //user already exists

        const result = await user_db.modifyUserRights(req.params.username, req.body.oldType, req.body.newType);
        res.status(200).json(result);

    } catch (err) {
        res.status(503).send(err);
    }
});

// DELETE the user identified by username (email) and type.
router.delete('/api/users/:username/:type', [
    check('username').isEmail(),
    check('type').custom(val => {
        return CheckifTypeAllowed(val);
    })
], async (request, response) => {

    try {
        const errors = validationResult(request);
        if (!errors.isEmpty())
            return response.status(422).json({ errors: errors.array() });

        let user = await user_db.getUserByUsernameAndType(request.params.username, request.params.type);
        if (user.length == 0)
            return response.status(422).end(); //user not found

        await user_db.deleteUser(request.params.username, request.params.type);
        response.status(204).end();
    }
    catch (err) {
        response.status(503).json({ error: `Database error while deleting: ${request.params.username}.` });
    }
});


/************* END Users API ***************/
module.exports = router;