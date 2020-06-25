const { Set } = require('../../database/models');
const { OperationErrors, AccessErrors } = require('../../errors')
const vars = require('../../vars');
const logger = require('log4js').getLogger('Card_resolvers');

card = (id) => {
    return new Promise((resolve, reject) => {
        Set.findOne({ cards: { $elemMatch: { _id: id } } }).lean().then((set) => {
            if (!set) {
                reject(OperationErrors.setNotFound);
            } else {
                resolve(set.cards.find((card) => { card._id == id }));
            }
        }).catch((err) => {
            logger.error(err);
            reject(err);
        });
    });
};

cards = (cards, ids, limit) => {
    if (!ids || ids.length == 0) {
        if (limit) {
            return cards.slice(0, limit);
        } else {
            return cards;
        }
    } else {
        if (limit) {
            return cards.filter((card) => { return ids.indexOf(card._id) > -1 }).slice(0, limit);
        } else {
            return cards.filter((card) => { return ids.indexOf(card._id) > -1 });
        }
    }
};

removeCard = (setId, cardId, user) => {
    return new Promise((resolve, reject) => {
        Set.findOne({ _id: setId }).then((set) => {
            if (!set) {
                reject(OperationErrors.setNotFound);
            } else {
                if (user.role == vars.ROLES.asObj.ADMIN.value || set.ownerId == user.id) {
                    const targetCard = set.cards.id(cardId);
                    if (!targetCard) {
                        reject(OperationErrors.cardNotFound);
                    } else {
                        set.updateOne({ $pull: { cards: { _id: cardId } } }).then(() => {
                            resolve(targetCard);
                        }).catch((err) => {
                            logger.error(err);
                            reject(err);
                        });
                    }
                } else {
                    reject(AccessErrors.notOwner);
                }
            }
        }).catch((err) => {
            logger.error(err);
            reject(err);
        });
    });
};

updateCard = (setId, cardId, update, user) => {
    return new Promise((resolve, reject) => {
        Set.findOne({ _id: setId }).then((set) => {
            if (!set) {
                reject(OperationErrors.setNotFound);
            } else {
                if (user.role == vars.ROLES.asObj.ADMIN.value || set.ownerId == user.id) {
                    const targetCard = set.cards.id(cardId);
                    if (!targetCard) {
                        reject(OperationErrors.cardNotFound);
                    } else {
                        if (update.kanji) targetCard.kanji = update.kanji;
                        if ('kanji' in update && !update.kanji) targetCard.kanji = undefined;
                        if (update.kana) targetCard.kana = update.kana;
                        if ('kana' in update && !update.kana) targetCard.kana = undefined;
                        if (update.description) targetCard.description = update.description;
                        if ('description' in update && !update.description) targetCard.description = undefined;

                        set.save({ validateBeforeSave: true }).then(() => {
                            resolve(targetCard);
                        }).catch((err) => {
                            logger.error(err);
                            reject(err)
                        });
                    }
                } else {
                    reject(AccessErrors.notOwner);
                }
            }
        }).catch((err) => {
            logger.error(err);
            reject(err);
        })
    });
}


module.exports = { card, cards, removeCard, updateCard };