/**
 * Centralized logging utility
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Get log level from env, default to INFO in production
const CURRENT_LOG_LEVEL =
  process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

/**
 * Format log message with timestamp and context
 */
const formatMessage = (level, context, message, data) => {
  const timestamp = new Date().toISOString();
  const levelStr = Object.keys(LOG_LEVELS).find((k) => LOG_LEVELS[k] === level);

  const parts = [`[${timestamp}]`, `[${levelStr}]`, `[${context}]`, message];

  const formatted = parts.join(' ');

  return data ? `${formatted}\n${JSON.stringify(data, null, 2)}` : formatted;
};

export const logger = {
  debug: (context, message, data) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      console.log(formatMessage(LOG_LEVELS.DEBUG, context, message, data));
    }
  },

  info: (context, message, data) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
      console.info(formatMessage(LOG_LEVELS.INFO, context, message, data));
    }
  },

  warn: (context, message, data) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(formatMessage(LOG_LEVELS.WARN, context, message, data));
    }
  },

  error: (context, message, data) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
      console.error(formatMessage(LOG_LEVELS.ERROR, context, message, data));
    }
  },
};

/**
 * Performance monitoring
 */
export const createTimer = (label) => {
  const start = performance.now();

  return {
    end: () => {
      const duration = performance.now() - start;
      logger.debug('Performance', `${label}: ${duration.toFixed(2)}ms`);
      return duration;
    },
  };
};
