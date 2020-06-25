const {
    GraphQLString,
    GraphQLBoolean,
    GraphQLNonNull
} = require("graphql");
const { generic } = require('../../resolvers');

RequiredString = { 
    type: new GraphQLNonNull(GraphQLString) 
};

OptionalString =  {
    type: GraphQLString
};


RequiredBoolean = {
    type: new GraphQLNonNull(GraphQLBoolean)
};

OptionalBoolean = {
    type: GraphQLBoolean
}

Id = {
    type: new GraphQLNonNull(GraphQLString),
    resolve: generic.idGrabber
};

module.exports = { RequiredString, OptionalString, Id, RequiredBoolean, OptionalBoolean };