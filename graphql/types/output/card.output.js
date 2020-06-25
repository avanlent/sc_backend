const { GraphQLObjectType } = require("graphql");
const genericFields = require('../fields/generic.fields');

const CardType = new GraphQLObjectType({
    name: 'Card',
    fields: () => ({
        kanji: genericFields.OptionalString,
        kana: genericFields.OptionalString,
        description: genericFields.OptionalString,
        id: genericFields.Id
    })
});

module.exports = { CardType };