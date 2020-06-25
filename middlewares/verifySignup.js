const { User } = require('./../database/models');
const logger = require('log4js').getLogger('Signup');

checkDuplicateUsernameOrEmailTiered = (req, res, next) => {
    User.findOne({ email: req.body.email }).lean().then((user) => {
        if (user) {
            res.status(400).send({ message: "Failed! Email already in use."});
            return;
        }

        User.findOne({ username: req.body.username }).lean().then((user) => {
            if (user) {
                res.status(400).send({ message: "Failed! Username already taken."});
                return;
            }
            next();
        }).catch((err) => {
            res.status(500).send({ message: "Database error."});
        });
        
    }).catch((err) => {
        res.status(500).send({ message: "Database error."});
    });
};

checkDuplicateUsernameOrEmail = (req, res, next) => {
    User.find({ $or: [{email: req.body.email}, {username: req.body.username}] }).lean().then((users) => {
        if (users.length == 0) {
            next();
        } else {
            var name = false;
            var mail = false;
            for (var i = 0; i < users.length; i++) {
                if (!name) name = users[i].username == req.body.username;
                if (!mail) mail = users[i].email == req.body.email 
            }
            var msg = "";
            if (name && mail) msg = "Failed! Username and email already taken."
            else if (name && !mail) msg = "Failed! Username already taken."
            else if (!name && mail) msg = "Failed! Email already taken."
            
            if (name || mail) res.status(400).send({ message: msg, isUsernameTaken: name, isEmailTaken: mail, problem: 'already_taken' });
            else next();
        }
    }).catch((err) => {
        logger.error(err);
        res.status(500).send({ message: "Failed! Database error."});
    })
};

module.exports = { checkDuplicateUsernameOrEmail, checkDuplicateUsernameOrEmailTiered };