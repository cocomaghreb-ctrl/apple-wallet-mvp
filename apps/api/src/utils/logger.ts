const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const;

const log = (level: keyof typeof LOG_LEVELS, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${LOG_LEVELS[level]} ${message}`;

  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

export const logger = {
  debug: (message: string, data?: any) => log('DEBUG', message, data),
  info: (message: string, data?: any) => log('INFO', message, data),
  warn: (message: string, data?: any) => log('WARN', message, data),
  error: (message: string, data?: any) => log('ERROR', message, data),
};
