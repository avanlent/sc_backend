const log4js = require('log4js');
const exitHook = require('exit-hook');

log4js.addLayout('jsonLayout', function(config) {
    return function(logEvent) { 
        const log = {};
        log.time = logEvent.startTime;
        log.category = logEvent.categoryName;
        log.data = logEvent.data;
        log.level = {
            value: logEvent.level.level,
            name: logEvent.level.levelStr,
            color: logEvent.level.colour
        }

        stringifyErrors = (key, value) => {
            if (value instanceof Error) {
                var error = {};

                Object.getOwnPropertyNames(value).forEach((key) => {
                    error[key] = value[key];
                });

                return error;
            }
            return value;
        }

        return JSON.stringify(log, stringifyErrors) + config.separator; 
    }
});

log4js.configure({
    appenders: {
        console: { type: 'stdout' },
        all: { type: 'file', filename: 'logs/all.log' },
        allJSON: { type: 'file', filename: 'logs/allJSON.log', layout: { type: 'jsonLayout', separator: ','} },
        errors: { type: 'file', filename: 'logs/errors.log' },
        errorsJSON: { type: 'file', filename: 'logs/errorsJSON.log', layout: { type: 'jsonLayout', separator: ','} },
        'just-errors': { type: 'logLevelFilter', appender: 'errors', level: 'warn' },
        'just-errors-JSON': { type: 'logLevelFilter', appender: 'errorsJSON', level: 'warn' },
    },
    categories: {
        default: { appenders: ['console', 'allJSON', 'just-errors-JSON'], level: 'all' },
        console: { appenders: ['console'], level: 'all' },
    }
});

exitHook(() => {
    log4js.shutdown();
});

module.exports = log4js;