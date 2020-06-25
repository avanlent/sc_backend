const { User } = require('../database/models');
const { verifySignup } = require('../middlewares');
const router = require('express').Router();
const logger = require('log4js').getLogger('Auth_route');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

router.post('/signup', verifySignup.checkDuplicateUsernameOrEmail, (req, res) => {
    if(!req.body.username || !req.body.email || !req.body.password) {
        return res.status(400).send({ message: "Failed! Username, email, and password required to sign up." });
    }

    if(req.body.password.length > 128 || req.body.password.length < 8) {
        return res.status(400).send({ message: "Failed! Username must be at least 8 and at most 128 characters." });
    }

    var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        createdAt: Date()
    });

    newUser.save().then((user) => {
        var token = jwt.sign({ id: user._id }, process.env.TOKENKEY, { expiresIn: 28800 /* 8hr */ });
        res.status(201).send({ message: "User registered successfully!", accessToken: token, username: user.username });
    }).catch((err) => {
        logger.error(err);
        res.status(500).send({ message: err.message });
    });

});

router.post('/signin', (req, res) => {
    if (req.body.username && req.body.email) {
        return res.status(400).send({ message: "Do not provide both email and username. Give only one." })
    }

    if (!((req.body.username || req.body.email) && req.body.password)) {
        return res.status(400).send({ message: "Failed! Password and one of username/email needed to sign in." });
    }

    User.findOne({ $or: [{username: req.body.username}, {email: req.body.email}] }).lean().then((user) => {
        if (!user) {
            return res.status(404).send({ message: "Failed! User not found.", problem: 'no_user' });
        }

        var passIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passIsValid) return res.status(401).send({ message: "Failed! Invalid password.", problem: 'bad_password' });

        var token = jwt.sign({ id: user._id }, process.env.TOKENKEY, { expiresIn: 28800 /* 8hr */ });

        res.status(200).send({ message: "Signin successful!", accessToken: token, username: user.username });
    }).catch((err) => {
        logger.error(err);
        res.status(500).send({ message: err.message });
    });
});

router.get('/check', (req, res) => {
    let token = req.headers["x-access-token"];

    if (!token) return res.status(403).send({ message: "No token provided!" });

    jwt.verify(token, process.env.TOKENKEY, (err, decoded) => {
        if (err) return res.status(401).send({ message: "Unauthorized!"});
        else {
            var token = jwt.sign({ id: decoded.id }, process.env.TOKENKEY, { expiresIn: 28800 /* 8hr */ });
            res.status(200).send({ message: "Token is valid", accessToken: token });
        }
    });
});

module.exports = router;