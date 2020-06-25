const { GraphQLInputObjectType, GraphQLList } = require("graphql");
const genericFields = require('../fields/generic.fields')
const CardInputType = require('./card.input')

module.exports = new GraphQLInputObjectType({
    name: 'SetUpdateInput',
    fields: () => ({
        name: genericFields.OptionalString,
        description: { type: genericFields.OptionalString.type, description: "Set to null or empty string to remove description" },
        public: { type: genericFields.OptionalBoolean.type },
        cards: { type: new GraphQLList(CardInputType), description: "Careful when updating a set with this field, it'll replace the array of cards with this one (if provided)." }
    })
});
