const mongoose = require('mongoose');
const { userDB } = require('../connections');
const { ROLES } = require('../../vars');

var userSchema = mongoose.Schema({
    /* implicit _id */
    username: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        minLength: [3, 'Username must be at least 3 characters long.'],
        maxLength: [32, 'Username cannot exceed 32 characters.'],
        validate: [
            /^([A-Za-z0-9\_\-]+)$/,
            'Username can only contain letters, numbers, underscores, and dashes.'
        ]
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        validate: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 
            'Invalid email format.'
        ]
    },
    password: { 
        type: String, 
        required: true,
        maxLength: [8, 'Password must be at least 8 characters.'],
        maxLength: [128, 'Password cannot exceed 128 characters.'],
    },
    createdAt: {
        type: Date,
        required: true
    },
    role: { 
        type: String, 
        enum: ROLES.asArray, 
        default: "USER"
    }
}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
      }
});
var User = userDB.model('User', userSchema);

module.exports = User;