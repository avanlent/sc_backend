const { User, Set } = require('../../database/models');
const { OperationErrors, AccessErrors } = require('../../errors')
const vars = require('../../vars');
const logger = require('log4js').getLogger('Set_resolvers');

owner = (id) => {
    return new Promise((resolve, reject) => {
        User.findById(id, 'username').lean().then((user) => {
            if (!user) {
                reject(OperationErrors.userNotFound);
            } else { 
                resolve(user);
            }
        }).catch((err) => {
            logger.error(err);
            reject(err);
        });
    });
};

singeSet = (id, user) => {
    return new Promise((resolve, reject) => {
        Set.findOne({ _id: id }).lean().then((set) => {
            if (!set) {
                reject(OperationErrors.setNotFound);
            } else {
                if (set.public || user.role == vars.ROLES.asObj.ADMIN.value || set.ownerId == user.id) {
                    resolve(set);
                } else {
                    reject(AccessErrors.notOwner)
                }
            }
        }).catch((err) => {
            logger.error(err);
            reject(err);
        })

    });
};

/**
 * Return paginated sets
 */
multipleSets = (search, page, perPage, includePrivate, onlyUserSets, user) => {
    if (onlyUserSets) return multipleSetsUser(search, page, perPage, user);
    return new Promise((resolve, reject) => {
        const query = {};

        if (search) query.$text = {$search: search};
        switch (user.role) {
            case "GUEST": {
                query.public = true;
                break;
            }
            case vars.ROLES.asObj.MODERATOR.value:
            case vars.ROLES.asObj.USER.value: {
                if (includePrivate) {
                    query.$or = [{public: true}, {ownerId: user.id}];
                } else {
                    query.public = true;
                }
                break;
            }
            case vars.ROLES.asObj.ADMIN.value: {
                if (!includePrivate) query.public = true;
                break;
            }
            default: {
                query.public = true;
            }
        }

        Set.find(query).limit(perPage).skip(perPage * page).lean().then((sets) => {
            if (sets.length == 0) {
                reject(OperationErrors.noResults);
            } else {
                resolve(sets);
            }
        }).catch((err) => {
            logger.error(err);
            reject(err);
        });
    });
};

multipleSetsUser = (search, page, perPage, user) => {
    return new Promise((resolve, reject) => {
        if (user.role == "GUEST") {
            reject(AccessErrors.requireLogin);
        } else {
            const query = { ownerId: user.id };
            if (search) query.$text = {$search: search};

            Set.find(query).limit(perPage).skip(perPage * page).lean().then((sets) => {
                if (sets.length == 0) {
                    reject(OperationErrors.noResults);
                } else {
                    resolve(sets);
                }
            }).catch((err) => {
                logger.error(err);
                reject(err);
            });
        }
    });
};

addSet = (set, user) => {
    return new Promise((resolve, reject) => {
        const newSet = new Set({
            name: set.name,
            ownerId: user.id
        });
        if (set.description) newSet.description = set.description;
        if (set.public) newSet.public = set.public;
        if (set.cards) newSet.cards = set.cards;

        newSet.save({ lean: true }).then((set) => {
            resolve(set);
        }).catch((err) => {
            logger.error(err);
            reject(err);
        })
    });
};

removeSet = (setId, user) => {
    return new Promise((resolve, reject) => {
        Set.findOne({ _id: setId }).select('ownerId').lean().then((set) => {
            if (!set) {
                reject(OperationErrors.setNotFound);
            } else {
                if (user.role == vars.ROLES.asObj.ADMIN.value || set.ownerId == user.id) {
                    Set.findByIdAndDelete(set._id).lean().then((set) => {
                        resolve(set);
                    }).catch((err) => {
                        logger.error(err);
                        reject(err);
                    });
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

addCard = (setId, card, user) => {
    return new Promise((resolve, reject) => {
        Set.findById(setId).select('ownerId').lean().then((set) => {
            if (!set) {
                reject(OperationErrors.setNotFound);
            } else {
                if (user.role == vars.ROLES.asObj.ADMIN.value || set.ownerId == user.id) {
                    if ('kanji' in card && !card.kanji) card.kanji = undefined;
                    if ('kana' in card && !card.kana) card.kana = undefined;
                    if ('description' in card && !card.description) card.description = undefined;

                    Set.findByIdAndUpdate(
                        setId, 
                        { $push: { cards: card}}, 
                        { runValidators: true, new: true, omitUndefined: true }
                    ).then((set) => {
                        resolve(set);
                    }).catch((err) => {
                        logger.error(err);
                        reject(err);
                    });
                } else {
                    reject(AccessErrors.notOwner);
                }
            }
        }).catch((err) => {
            logger.error(err);
            reject(err);
        })
    });
};

updateSet = (setId, update, user) => {
    return new Promise((resolve, reject) => {
        Set.findById(setId).select('ownerId').lean().then((set) => {
            if (!set) {
                reject(OperationErrors.setNotFound);
            } else {
                if (user.role == vars.ROLES.asObj.ADMIN.value || set.ownerId == user.id) {
                    var unset = {};
                    if ('public' in update) update.public = !!update.public;
                    if ('description' in update && !update.description) {
                        update.description = undefined;
                        unset = { description: "" };
                    }
                    Set.findByIdAndUpdate(
                        setId, 
                        { $set: update, $unset: unset }, 
                        { runValidators: true, new: true, omitUndefined: true, setDefaultsOnInsert: true }
                    ).then((set) => {
                        resolve(set);
                    }).catch((err) => {
                        logger.error(err);
                        reject(err);
                    });
                } else {
                    reject(AccessErrors.notOwner);
                }
            }
        }).catch((err) => {
            logger.error(err);
            reject(err);
        })
    });
};

userSets = (user) => {
    return new Promise((resolve, reject) => {
        if (user.role == "GUEST") {
            reject(AccessErrors.requireLogin);
        } else {
            const query = { ownerId: user.id };
            Set.find(query).lean().then((sets) => {
                resolve(sets);
            }).catch((err) => {
                logger.error(err);
                reject(err);
            });
        }
    });
}

endorsedSets = () => {
    return new Promise((resolve, reject) => {
        Set.find({
            _id: { $in: process.env.ENDORSED_SETS.split(' ') },
            public: true
        }).lean().then((sets) => {
            if (sets.length == 0) {
                reject(OperationErrors.noResults);
            } else {
                resolve(sets);
            }
        }).catch((err) => {
            logger.error(err);
            reject(err);
        })
    })
}

module.exports = { owner, singeSet, multipleSets, addSet, removeSet, addCard, updateSet, endorsedSets, userSets };