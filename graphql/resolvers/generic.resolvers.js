const mongoose = require('mongoose');
const { ArgumentErrors, AccessErrors } = require('../../errors')

/**
 * Returns the mongodb ObjectID from given document
 */
idGrabber = (parent) => {
    return parent._id 
};

/**
 * Verifies that arguments length within [min, max]. Throws Error on failed check.
 */
argLengthCheck = (args, min, max) => {
    if (Object.keys(args).length < min || Object.keys(args).length > max) throw ArgumentErrors.argLengthInvalid(min, max);
};

/**
 * Verifies that an ID is a well formated mongodb ObjectID. Throws Error on invalid id.
 * Does nothing if ID is undefined/null/etc.
 */
idCheck = (id) => {
    if (id && !mongoose.Types.ObjectId.isValid(id)) throw ArgumentErrors.argIdInvalid;
};

userCheck = (user) => {
    if (user.error) throw user.error;
}

requireLogin = (user) => {
    if (user.role == "GUEST") throw AccessErrors.requireLogin;
}

module.exports = { idGrabber, argLengthCheck, idCheck, userCheck, requireLogin, requireModerator, requireAdmin, requireModeratorOrAdmin }