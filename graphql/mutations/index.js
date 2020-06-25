const { GraphQLObjectType } = require("graphql");
const { addCard, addSet, removeSet, updateSet } = require('./set.mutations');
const { removeCard, updateCard } = require('./card.mutations')

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    description: 'All the actions that can be done to sets or the cards within a set',
    fields: {
        addSet,
        removeSet,
        updateSet,
        addCard,
        removeCard,
        updateCard
    }
});

module.exports = Mutation;