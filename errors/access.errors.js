class AccessError extends Error {
    code = 100;
    category = 'Access';
    constructor(msg, code, desc) {
        super('Unauthorized! ' + msg)
        if (code) this.code = code;
        if (desc) this.description = desc;
    }
}

module.exports = {
    AccessError,
    tokenMalformed: new AccessError('Malformed token error', 101),
    tokenExpired: new AccessError('Token is expired', 102),
    tokenError: new AccessError('Token error', 103),
    tokenBadId: new AccessError('Token contains invalid id', 104),
    tokenNoUser: new AccessError('Token contains unregistered user', 105),
    requireLogin: new AccessError('Action requires login', 106),
    requireHigherRole: new AccessError('Actions requires higher role', 107),
    notOwner: new AccessError('Not set owner', 108),
};