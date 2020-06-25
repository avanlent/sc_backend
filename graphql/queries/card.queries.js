const { CardType } = require('../types');
const { cardResolver, generic } = require('../resolvers')
const genericFields = require('../types/fields/generic.fields');

card = {
    type: CardType,
    args: {
        id: genericFields.OptionalString,
    },
    resolve: (parent, args, req) => {
        generic.userCheck(req.user);
        generic.idCheck(args.id);

        return cardResolver.card(args.id);
    }
};

module.exports = { card }
