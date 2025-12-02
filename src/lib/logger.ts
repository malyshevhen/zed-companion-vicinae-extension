export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  error?: Error;
  data?: Record<string, any>;
  timestamp: Date;
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private log(level: LogLevel, message: string, context?: string, error?: Error, data?: Record<string, any>): void {
    if (level < this.level) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      error,
      data,
      timestamp: new Date(),
    };

    const levelName = LogLevel[level];
    const prefix = context ? `[${context}]` : '';
    const logMessage = `${levelName}${prefix}: ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, entry);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, entry);
        break;
    }
  }

  debug(message: string, context?: string, data?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context, undefined, data);
  }

  info(message: string, context?: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context, undefined, data);
  }

  warn(message: string, context?: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context, undefined, data);
  }

  error(message: string, context?: string, error?: Error, data?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error, data);
  }
}

export const logger = new Logger();