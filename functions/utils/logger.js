const logger = {
    log: (message, data = null) => {
        console.log(message, data ? JSON.stringify(data, null, 2) : '');
    },
    error: (message, error = null) => {
        console.error(message, error ? JSON.stringify(error, null, 2) : '');
    }
};

module.exports = logger;
