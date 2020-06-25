class ArgumentError extends Error {
    code = 200;
    category = 'Argument';
    constructor(msg, code, desc) {
        super(msg)
        if (code) this.code = code;
        if (desc) this.description = desc;
    }
}

var argLengthInvalid = (min, max) => {
     return new ArgumentError(`Too many/few arguments [min: ${min}, max: ${max}]`, 201);
};

var argValueInvalid = (name, given) => {
    return new ArgumentError(`Argument \'${name}\' invalid. Provided value: ${given}`, 202);
};

var argValueOutOfRange = (name, given, min, max) => {
    return new ArgumentError(`Argument \'${name}\' out of range [min: ${min}, max: ${max}]. Provided value: ${given}`, 203);
};

var argValueTooLow = (name, given, min) => {
    return new ArgumentError(`${name} must be at least ${min}. Provided value: ${given}`, 204);
};

var argValueTooHigh = (name, given, max) => {
    return new ArgumentError(`${name} cannot exceed ${max}. Provided value: ${given}`, 205);
};

module.exports = {
    ArgumentError,
    argLengthInvalid,
    argValueInvalid,
    argValueOutOfRange,
    argValueTooLow,
    argValueTooHigh,
    argIdInvalid: new ArgumentError('Invalid Id', 206)
}