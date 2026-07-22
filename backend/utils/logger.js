/**
 * Simple Logger Utility
 * Logs messages to console and file
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, `app-${new Date().toISOString().split('T')[0]}.log`);

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Format log message with timestamp
 */
const formatMessage = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
};

/**
 * Write to log file
 */
const writeLog = (message) => {
    try {
        fs.appendFileSync(LOG_FILE, message + '\n');
    } catch (error) {
        console.error('Error writing to log file:', error);
    }
};

module.exports = {
    info: (message, data = null) => {
        const formatted = formatMessage('INFO', message, data);
        console.log(formatted);
        writeLog(formatted);
    },

    error: (message, error = null) => {
        const errorData = error instanceof Error ? error.message : error;
        const formatted = formatMessage('ERROR', message, errorData);
        console.error(formatted);
        writeLog(formatted);
    },

    warn: (message, data = null) => {
        const formatted = formatMessage('WARN', message, data);
        console.warn(formatted);
        writeLog(formatted);
    },

    debug: (message, data = null) => {
        if (process.env.DEBUG === 'true') {
            const formatted = formatMessage('DEBUG', message, data);
            console.log(formatted);
            writeLog(formatted);
        }
    }
};
