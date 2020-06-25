const mongoose = require('mongoose');
const { dataDB } = require('./../connections');
const { ValidationError, DatabaseError } = require('../../errors')

handleErrors = (err, item, next) => {
    if (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            var desc = {}
            var hasSetPath = false;
            var hasCardPath = false;
            const cardPaths = ['kanji', 'kana', 'description'];
            for (invalidField in err.errors) {
                if (cardPaths.indexOf(err.errors[invalidField].path) > -1 || err.errors[invalidField].path.startsWith('cards')) {
                    hasCardPath = true;
                } else {
                    hasSetPath = true;
                }
                desc[err.errors[invalidField].path] = err.errors[invalidField].message;
            }
            var msg = "Validation failed!";
            if (hasSetPath && hasCardPath) msg = "Set and Card validation failed!";
            else if (hasSetPath) msg = "Set validation failed!";
            else if (hasCardPath) msg = "Card validation failed!";

            next(new ValidationError(msg, desc));
        } else {
            next(new DatabaseError(err.message));
        }
    } else {
        next();
    }
}

var cardSchema = mongoose.Schema({
    /* implicit _id */
    kanji: { 
        type: String, 
        trim: true,
        minlength: 1,
        maxlength: [32, 'Kanji cannot exceed 32 characters.'],
    },
    kana: { 
        type: String, 
        trim: true,
        minlength: 1,
        maxlength: [32, 'Kana cannot exceed 32 characters.'],
    },
    description: { 
        type: String, 
        trim: true,
        minlength: 1,
        maxlength: [256, 'Descriptions cannot exceed 256 characters.'],
    },
}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
      }
});
cardSchema.pre('validate', function (next) {
    var numValid = 0;
    if (this._doc.kanji) numValid++;
    if (this._doc.kana) numValid++;
    if (this._doc.description) numValid++;

    if (numValid < 2) next(Error('A card requires at least 2 valid fields of kanji/kana/description.'));
    else next();
});
// cardSchema.post('save', handleErrors);
// cardSchema.post('remove', handleErrors);
// cardSchema.post('updateOne', handleErrors);
// cardSchema.post('deleteOne', handleErrors);
// cardSchema.post('deleteMany', handleErrors);
// cardSchema.post('find', handleErrors);
// cardSchema.post('findOne', handleErrors);
// cardSchema.post('findOneAndDelete', handleErrors);
// cardSchema.post('findOneAndUpdate', handleErrors);
// cardSchema.post('update', handleErrors);
// cardSchema.post('updateMany', handleErrors);

var setSchema = mongoose.Schema({
    /* implicit _id */
    name: { 
        type: String, 
        required: true, 
        minlength: [1, 'Set names must be at least 1 character long.'], 
        maxlength: [32, 'Set names cannot exceed 32 characters.'], 
        trim: true,
    },
    description: { 
        type: String, 
        maxLength: [1024, 'Set descriptions cannot exceed 1024 characters.'], 
        trim: true,
    },
    public: { 
        type: Boolean, 
        required: true,
        default: false 
    },
    ownerId: { 
        // the user's ID
        type: String,
        required: true
    },
    cards: {
        type: [cardSchema],
        required: true,
        default: []
    }
}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
      }
});
setSchema.index({name: 'text', description: 'text'});

setSchema.post('save', handleErrors);
setSchema.post('remove', handleErrors);
setSchema.post('updateOne', handleErrors);
setSchema.post('deleteOne', handleErrors);
setSchema.post('deleteMany', handleErrors);
setSchema.post('find', handleErrors);
setSchema.post('findOne', handleErrors);
setSchema.post('findOneAndDelete', handleErrors);
setSchema.post('findOneAndUpdate', handleErrors);
setSchema.post('update', handleErrors);
setSchema.post('updateMany', handleErrors);

var Set = dataDB.model('Set', setSchema);

module.exports = Set;