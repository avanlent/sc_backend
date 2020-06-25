const { GraphQLInputObjectType } = require("graphql");
const genericFields = require('../fields/generic.fields')

module.exports = new GraphQLInputObjectType({
    name: 'CardInput',
    fields: () => ({
        kanji: genericFields.OptionalString,
        kana: genericFields.OptionalString,
        description: genericFields.OptionalString,
    })
});
