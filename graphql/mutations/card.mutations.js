const { GraphQLNonNull } = require("graphql");
const { CardInputType, CardType } = require('../types');
const { generic, cardResolver } = require('../resolvers');
const genericFields = require('../types/fields/generic.fields')

module.exports = {
    updateCard: {
        type: CardType,
        description: 'Requires login. Only updates the fields that are provided. To remove a field, set the field to null or an empty string. Returns updated card.',
        args: {
            setId: genericFields.RequiredString,
            cardId: genericFields.RequiredString,
            update: { type: new GraphQLNonNull(CardInputType) },
        },
        resolve(parent,args,req) {
            generic.userCheck(req.user);
            generic.requireLogin(req.user);
            generic.idCheck(args.setId);
            generic.idCheck(args.cardId);

            return cardResolver.updateCard(args.setId, args.cardId, args.update, req.user);
        }
    },

    removeCard: {
        type: CardType,
        description: "Requires login. Remove card from a set. Must be set owner. Returns the removed Card",
        args: {
            setId: genericFields.RequiredString,
            cardId: genericFields.RequiredString
        },
        resolve(parent,args,req) {
            generic.userCheck(req.user);
            generic.requireLogin(req.user);
            generic.idCheck(args.setId);
            generic.idCheck(args.cardId);

            return cardResolver.removeCard(args.setId, args.cardId, req.user);
        }
    },
};
