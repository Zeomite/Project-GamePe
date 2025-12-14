const formatMessage = (level: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(formatMessage('INFO', message), ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(formatMessage('ERROR', message), ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(formatMessage('WARN', message), ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('DEBUG', message), ...args);
    }
  },
};

