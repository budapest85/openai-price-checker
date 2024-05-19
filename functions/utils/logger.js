const logger = {
    log: (message, data = null) => {
        console.log(message, data ? JSON.stringify(data, null, 2) : '');
    },
    error: (message, error = null) => {
        console.error(message, error ? JSON.stringify(error, null, 2) : '');
    },
    warn: (message, warning = null) => {
        console.warn(message, warning ? JSON.stringify(warning, null, 2) : '');
    }
};

module.exports = logger;
