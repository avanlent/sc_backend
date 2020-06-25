class OperationError extends Error {
    code = 300;
    category = 'Operation';
    constructor(msg, code, desc) {
        super(msg)
        if (code) this.code = code;
        if (desc) this.description = desc;
    }
}

module.exports = {
    OperationError,
    noResults: new OperationError('No Reults', 301),
    setNotFound: new OperationError('No set with given Id found', 302),
    userNotFound: new OperationError('No user found with given Id', 303),
    cardNotFound: new OperationError('No card with given Id found in set', 304)
}