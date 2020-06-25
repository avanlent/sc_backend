const ExpressGraphQL = require("express-graphql");
const { GraphQLSchema } = require("graphql");
const Mutation = require('./mutations');
const Query = require('./queries');

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});

module.exports = ExpressGraphQL({
    schema: schema,
    graphiql: true,
    customFormatErrorFn: (err) => {
        if (err.message.startsWith('Unknown argument')) {
            return {
                category: 'Argument',
                message: err.message,
                code: 201,
                // stack: err.stack ? err.stack.split('\n') : [],
                locations: err.locations,
                path: err.path
            }
        } else {
            return {
                category: (err.originalError && err.originalError.category) || 'General',
                message: err.message,
                description: err.originalError && err.originalError.description,
                code: (err.originalError && err.originalError.code) || 900,
                // stack: err.stack ? err.stack.split('\n') : [],
                locations: err.locations,
                path: err.path
            }
        }
    }
});