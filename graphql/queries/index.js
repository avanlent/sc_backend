const {
    GraphQLObjectType, 
} = require("graphql");
const { set, sets, endorsedSets, allUserSets } = require('./set.queries');

const Query = new GraphQLObjectType({
    name: 'Query',
    description: "Actions for retrieveing sets and cards.",
    fields: {
        set,
        sets,
        endorsedSets,
        allUserSets
    }
});

module.exports = Query;