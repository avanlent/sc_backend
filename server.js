const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" })

const express = require('express');
const cors = require('cors');
const { log4js } = require('./middlewares')


const logger = log4js.getLogger('Server'); // log4js.getLogger('console');
// logger.trace('trace');
// logger.debug('debug');
// logger.info('info');
// logger.warn('warn');
// logger.error('error');
// logger.fatal('fetal');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Origin",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

app.use(require('./routes'));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(__dirname + '/public/'));
    app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

const port = process.env.PORT || 8000;
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});