const config = require('../config');
const { User, Set } = require('../database/models');
const { verifySignup } = require('../middlewares');
const router = require('express').Router();
const logger = require('log4js').getLogger();

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

router.post('/addcard', (req, res) => {
    Set.findOne({_id: req.body.setId}).then((set) => {
        if(!set) return res.status(401).send("not set with that id")

        if ('kanji' in req.body.card && !req.body.card.kanji) req.body.card.kanji = undefined;
        if ('kana' in req.body.card && !req.body.card.kana) req.body.card.kana = undefined;
        if ('description' in req.body.card && !req.body.card.description) req.body.card.description = undefined;

        Set.findByIdAndUpdate(req.body.setId, { $push: { cards: req.body.card}}, { runValidators: true, new: true, omitUndefined: true }).then((set) => {res.status(200).send(set)}).catch((err) => {if (err){
            console.log(err)
            res.status(401).send("bad update")
        } 
    })
    }).catch((err) => {
        if (err) res.status(401).send("bad find");
    })
});

router.post('/removecard', (req, res) => {
    Set.findOne({_id: req.body.setId}).then((set) => {
        var originalCard = set.cards.id(req.body.cardId);
        if (!originalCard) return res.status(401).send("card id not ofund in set")

        set.updateOne({ $pull: { cards: {_id: req.body.cardId}}}).then(() => {res.status(200).send(originalCard)}).catch((err) => {if (err){
            console.log(err)
            res.status(401).send("bad update")
        } 
    })
    }).catch((err) => {
        console.log("i should not print uless error")
        if (err) res.status(401).send("bad find");
    })
});

router.post('/updatset', (req, res) => {
    Set.findOne({_id: req.body.setId}).then((set) => {
        if(!set) return res.status(200).send("no set with that id");

        const query = { $set: {} };
        if ('public' in req.body.set) query.$set.public = req.body.set.public
        if (req.body.set.name) query.$set.name = req.body.set.name;
        if (req.body.set.description) query.$set.description = req.body.set.description;
        if (req.body.set.cards) query.$set.cards = req.body.set.cards;

        set.updateOne(
            query,
            { new: true, lean: true, runValidators: true, setDefaultsOnInsert: true },
        ).then(() => {res.status(200).send("done")}).catch((err) => {if(err) { console.log(err); res.status(401).send("bad update")}})
    }).catch((err) => {
        if (err) res.status(401).send("bad find")
    })
})

router.post('/addset', (req, res) => {
    let newSet = new Set({
        name: req.body.set.name,
        ownerId: req.ip
    });
    if (req.body.set.description) newSet.description = req.body.set.description;
    if (req.body.set.public) newSet.public = req.body.set.public;
    if (req.body.set.cards) newSet.cards = req.body.set.cards;

    newSet.save().then((set) => {
        res.status(200).send(set);
    }).catch((err) => {
        res.status(401).send(err)
    })
});

router.post('/removeset', (req, res) => {
    Set.findByIdAndDelete(req.body.setId).then((set) => {
        if(!set) return res.status(300).send("not set with that id");
        res.status(200).send(set);
    }).catch((err) => {
        if (err) {
            console.log(err)
            res.status(401).send("bad find and delete")
        }
    });
});

router.post('/up', (req, res) => {

    // Set.findByIdAndUpdate(
    //     { _id: req.body.setId, cards: { $elemMatch: { _id: req.body.cardId } } },
    //     { $push: { cards: args.card } },
    //     { new: true, lean: true, runValidators: true, setDefaultsOnInsert: true },
    //     (err, set) => { if (err) reject(err); else resolve(set); }
    // );

    Set.findOne({ _id: req.body.setId }).then((set) => {
        // var idx = -1;
        // for (var i = 0; i < set.cards.length; i++) {
        //     if (set.cards[i]._id == req.body.cardId) {
        //         idx = i;
        //         break;
        //     }
        // }
        // if (idx == -1) return res.status(401).send("card id not ofund in set")
        var originalCard = set.cards.id(req.body.cardId);
        if (!originalCard) return res.status(401).send("card id not ofund in set")
        
        // if (req.body.card.kanji || originalCard.kanji) card['cards.0.kanji'] = (req.body.card.kanji || originalCard.kanji);
        // if (req.body.card.kana || originalCard.kana) card['cards.0.kana'] = (req.body.card.kana || originalCard.kana);
        // if (req.body.card.description || originalCard.description) card['cards.0.description'] = (req.body.card.description || originalCard.description);
        if (req.body.card.kanji) {
            originalCard.kanji = req.body.card.kanji
        }
        if ('kanji' in req.body.card && !req.body.card.kanji) {
            originalCard.kanji = undefined;
        }
        if (req.body.card.kana) {
            originalCard.kana = req.body.card.kana
        }
        if ('kana' in req.body.card && !req.body.card.kana) {
            originalCard.kana = undefined;
        }
        if (req.body.card.description) {
            originalCard.description = req.body.card.description
        }
        if ('description' in req.body.card && !req.body.card.description) {
            originalCard.description = undefined;
        }
        //set.markModified('cards')
        set.save({validateBeforeSave: true, lean: true }).then((ret)=>{res.status(200).send(originalCard);}).catch((err)=>{console.log(err)});
        

        // set.updateOne({$set: { 'cards.0': card} }, 
        //     { new: true, lean: true, runValidators: true, setDefaultsOnInsert: true }).then((set) => {
        //         res.status(200).send("done")
        // }).catch((err) => {
        //     console.log(err)
        //     if (err) res.status(401).send("bad update")
        // })

        //set.cards[idx].updateOne({$set: {kanji: "this shit"}}).then(() => { res.status(200).send("done")}).catch((err) => {if (err) {console.log(err); res.status(402).send("no go")}});

        // set.updateOne({$set: {"cards.0": { kana: null, kanji: null} } }, { new: true, lean: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }).then((set) => {
        //     res.status(200).send("done")
        // }).catch((err) => {
        //     console.log(err)
        //     if (err) res.status(401).send("bad update")
        // })
    }).catch((err) => {
        console.log(err)
        if (err) res.status(401).send("bad find")
    })
});

module.exports = router;