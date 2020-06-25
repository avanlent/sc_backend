const { GraphQLInputObjectType, GraphQLList } = require("graphql");
const genericFields = require('../fields/generic.fields')
const CardInputType = require('./card.input')

module.exports = new GraphQLInputObjectType({
    name: 'SetInput',
    fields: () => ({
        name: genericFields.RequiredString,
        description: genericFields.OptionalString,
        public: { type: genericFields.OptionalBoolean.type, description: "Default: false" },
        cards: { type: new GraphQLList(CardInputType) }
    })
});
