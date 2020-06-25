class ValidationError extends Error {
    code = 400;
    category = 'Validation';
    constructor(msg, desc) {
        super(msg)
        if (desc) this.description = desc;
    }
}

module.exports = ValidationError;