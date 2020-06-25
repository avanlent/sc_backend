const {
    GraphQLList,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean
} = require("graphql");
const { SetType } = require('../types');
const { setResolver, generic } = require('../resolvers')
const genericFields = require('../types/fields/generic.fields');

set = {
    type: SetType,
    description: "Get set by ID.\n\rNote: Only the owner (logged in) can access a private set.",
    args: {
        id: genericFields.RequiredString,
    },
    resolve: (parent, args, req) => {
        generic.userCheck(req.user);
        generic.idCheck(args.id);

        return setResolver.singeSet(args.id, req.user);
    }
};

sets = {
    type: new GraphQLList(SetType),
    description: "Zero-based indexing.\n\rBetter pagination coming whenever I have time to do it :/",
    args: {
        search: { type: GraphQLString },
        page: { type: GraphQLInt, description: "Default: 0"},
        perPage: { type: GraphQLInt, description: "Default: 10" },
        includePrivate: { type: GraphQLBoolean, description: "Include logged in user's private sets in query. Does nothing if not logged in or using onlyUserSets.\n\rDefault: false" },
        onlyUserSets: { type: GraphQLBoolean, description: "Requires login. Do query only on the sets owned by logged in user" }
    },
    resolve: (parent, args, req, info) => {
        if (!args.perPage || (args.perPage && (args.perPage > 40 || args.perPage < 0))) args.perPage = 10;
        if (!args.page || (args.page && args.page < 0)) args.page = 0;
        generic.userCheck(req.user);

        return setResolver.multipleSets(args.search, args.page, args.perPage, args.includePrivate, args.onlyUserSets, req.user);
    }
};

allUserSets = {
    type: new GraphQLList(SetType),
    description: "Get all the sets the logged in user owns",
    resolve: (parent, args, req, info) => {
        generic.userCheck(req.user);
        generic.requireLogin(req.user);

        return setResolver.userSets(req.user);
    }
}

endorsedSets = {
    type: new GraphQLList(SetType),
    description: "Get endorsed sets",
    resolve: (parent, args, req, info) => {
        generic.userCheck(req.user);
        return setResolver.endorsedSets();
    }
}

module.exports = { set, sets, endorsedSets, allUserSets }
