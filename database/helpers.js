const mongoose = require('mongoose');
const exitHook = require('exit-hook');
const { DatabaseError } = require('../errors');
const log4js = require('log4js');

const logger = log4js.getLogger('Database_helpers');

connect = (name) => {
    var db = mongoose.createConnection(
        `mongodb+srv://${process.env.DBUSER}:${process.env.DBKEY}@cluster0-ifkcb.gcp.mongodb.net/db?retryWrites=true&w=majority/${name}`, 
        { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }
    );

    db.on('connected', function() {
        logger.info('Connected to ' + name + ' DB. ' + + Date.now());
    });
    
    db.on('error', function(err) {
        logger.error(name + ' DB connection error. ' + Date.now(), err);
        throw new DatabaseError(`Database connection error for ${name}`)
    });
    
    db.on('disconnected', function() {
        logger.warn(name + ' DB disconnected. ' + Date.now());
    });

    exitHook(() => {
        db.close();
    })

    return db;
}

module.exports = { connect };