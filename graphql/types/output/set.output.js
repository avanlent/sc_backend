const {
    GraphQLList,
    GraphQLObjectType,
    GraphQLBoolean,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull
} = require("graphql");
const genericFields = require('../fields/generic.fields');
const { setResolver, generic, cardResolver } = require('../../resolvers');
const { CardType } = require('./card.output')
const { ArgumentErrors } = require('../../../errors')

const OwnerType = new GraphQLObjectType({
    name: 'Owner',
    fields: () => ({
        username: genericFields.RequiredString,
        id: genericFields.Id
    })
})

const SetType = new GraphQLObjectType({
    name: 'Set',
    fields: () => ({
        name: genericFields.RequiredString,
        description: genericFields.OptionalString,
        owner: { 
            type: new GraphQLNonNull(OwnerType),
            resolve: (parent) => { 
                generic.idCheck(parent.ownerId);
                return setResolver.owner(parent.ownerId);
            }
        },
        public: {
            type: GraphQLBoolean,
            resolve: (parent) => {
                return parent.public;
            }
        },
        cards: {
            type: new GraphQLList(CardType),
            args: {
                ids: { type: new GraphQLList(GraphQLString), description: "Limit cards by ids." },
                limit: { type: GraphQLInt, description: "Limits number of cards returned." }
            },
            resolve: (parent, args) => {
                if (args.limit && args.limit < 1) return ArgumentErrors.argValueTooLow('limit', args.limit, 1);
        
                return cardResolver.cards(parent.cards, args.ids, args.limit);
            }
        },
        numCards: {
            type: GraphQLInt,
            resolve: (parent) => {
                return parent.cards.length;
            }
        },
        id: genericFields.Id
    })
})

module.exports = { SetType, OwnerType };