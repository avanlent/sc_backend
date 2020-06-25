class DatabaseError extends Error {
    code = 800;
    category = 'Database';
    constructor(msg) {
        super(msg)
    }
}

module.exports = DatabaseError;