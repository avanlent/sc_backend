const router = require('express').Router();
const { auth } = require('../middlewares')

router.use('/api/auth', require('./auth.js'));
//router.use('/api/test', require('./test.js'));
router.use('/api/graphql/', [auth.setUser, require('../graphql')]);

module.exports = router;