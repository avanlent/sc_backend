const jwt = require('jsonwebtoken');
const vars = require('../vars');
const { User } = require('../database/models');
const mongoose = require('mongoose');
const { AccessErrors } = require('../errors')

setUser = (req, res, next) => {
    let token = req.headers["x-access-token"];
    req.user = {};

    req.user.is = function(role) {
        return this.role && this.role === role
    }

    if (!token) {
        req.user.role = "GUEST";
        req.user.id = "";
        next();
    } else {
        jwt.verify(token, process.env.TOKENKEY, (err, decoded) => {
            if (err) {
                switch(err.name) {
                    case 'TokenExpiredError': { req.user.error = AccessErrors.tokenExpired; break; }
                    case 'JsonWebTokenError': { req.user.error = AccessErrors.tokenMalformed; break; }
                    default: req.user.error = AccessErrors.tokenError;
                }
                next();
            } else {
                if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
                    req.user.error = AccessErrors.tokenBadId;
                    next();
                } else {
                    User.findById(decoded.id, 'role').lean().then((user) => {
                        if (!user) {
                            req.user.error = AccessErrors.tokenNoUser;
                        } else {
                            req.user.id = decoded.id;
                            req.user.role = user.role;
                        }
                        next();
                    }).catch((err) => {
                        req.user.error = err;
                    });
                }
            }
        });
    }
};

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) return res.status(403).send({ message: "No token provided!" });

    jwt.verify(token, process.env.TOKENKEY, (err, decoded) => {
        if (err) return res.status(401).send({ message: "Unauthorized!"});
        req.userId = decoded.id;
        next();
    });
};

requireAdmin = (req, res, next) => {
    User.findById(req.userId, 'role').lean().then((user) => {
        if (!user) return res.status(400).send({ message: "user not found." });
        if (user.role === vars.ROLES.asObj.ADMIN) next();
        else res.status(403).send({ message: "Require Admin Role!" });
    }).catch((err) => {
        return res.status(500).send({ message: "Database error."});
    });
};

requireModerator = (req, res, next) => {
    User.findById(req.userId, 'role').lean().then((user) => {
        if (!user) return res.status(400).send({ message: "user not found." });
        if (user.role === vars.ROLES.asObj.MODERATOR) next();
        else res.status(403).send({ message: "Require Moderator Role!" });
    }).catch((err) => {
        return res.status(500).send({ message: "Database error."});
    });
};

requireModeratorOrAdmin = (req, res, next) => {
    User.findById(req.userId, 'role').lean().then((user) => {
        if (!user) return res.status(400).send({ message: "user not found." });
        if (user.role === vars.ROLES.asObj.ADMIN || user.role === vars.ROLES.asObj.MODERATOR) next();
        else res.status(403).send({ message: "Require Moderator or Admin Role!" });
    }).catch((err) => {
        return res.status(500).send({ message: "Database error."});
    });
};

module.exports = { verifyToken, requireAdmin, requireModerator, requireModeratorOrAdmin, setUser };