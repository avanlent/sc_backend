const { GraphQLNonNull } = require("graphql");
const { SetType, CardInputType, SetInputType, SetUpdateInputType } = require('../types');
const { generic, setResolver } = require('../resolvers');
const genericFields = require('../types/fields/generic.fields')

module.exports = {
    addSet: {
        type: SetType,
        description: "Requires login. Adds newly created set to user's sets. Returns created set.",
        args: {
            set: { type: new GraphQLNonNull(SetInputType) }
        },
        resolve(parent,args,req) {
            generic.userCheck(req.user);
            generic.requireLogin(req.user);

            return setResolver.addSet(args.set, req.user);
        }
    },
    removeSet: {
        type: SetType,
        description: "Requires login. Removes set from user's sets. Returns removed set.",
        args: {
            setId: genericFields.RequiredString
        },
        resolve(parent,args,req) {
            generic.userCheck(req.user);
            generic.requireLogin(req.user);
            generic.idCheck(args.setId);

            return setResolver.removeSet(args.setId, req.user);
        }
    },
    addCard: {
        type: SetType,
        description: "Requires login. Adds a card to a user's set. Returns set that had card added to.",
        args: {
            setId: genericFields.RequiredString,
            card: { type: new GraphQLNonNull(CardInputType) }
        },
        resolve(parent, args, req) {
            generic.userCheck(req.user);
            generic.requireLogin(req.user);
            generic.idCheck(args.setId);

            return setResolver.addCard(args.setId, args.card, req.user);
        }
    },
    updateSet: {
        type: SetType,
        description: "Updates a user's set. Only updates provided fields. To remove a field, set to null or empty string. Returns updated set.",
        args: {
            setId: genericFields.RequiredString,
            update: { type: new GraphQLNonNull(SetUpdateInputType) }
        },
        resolve(parent,args,req) {
            generic.userCheck(req.user);
            generic.requireLogin(req.user);
            generic.idCheck(args.setId);

            return setResolver.updateSet(args.setId, args.update, req.user);
        }
    },
};
