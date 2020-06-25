const { connect } = require('./helpers');

// connect to DB
var userDB = connect('users');
var dataDB = connect('data');

module.exports = { userDB, dataDB };



