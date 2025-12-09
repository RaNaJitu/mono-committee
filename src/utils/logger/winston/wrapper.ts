import { FastifyBaseLogger } from 'fastify';
import winston from 'winston';
import { createChildLogger } from './index';

class FastifyWinstonLogger implements FastifyBaseLogger {
  private logger: winston.Logger;

  public level: string; // Required by FastifyBaseLogger

  constructor(logger: winston.Logger) {
    this.logger = logger;
    this.level = logger.level || 'info'; // Initialize the logging level
  }

  private formatLog(level: string, objOrMsg: unknown, msg?: string): void {
    if (typeof objOrMsg === 'object' && objOrMsg !== null) {
      this.logger.log(level, msg || '', objOrMsg);
    } else {
      this.logger.log(level, objOrMsg as string, {});
    }
  }

  info(objOrMsg: unknown, msg?: string): void {
    this.formatLog('info', objOrMsg, msg);
  }

  error(objOrMsg: unknown, msg?: string): void {
    this.formatLog('error', objOrMsg, msg);
  }

  warn(objOrMsg: unknown, msg?: string): void {
    this.formatLog('warn', objOrMsg, msg);
  }

  debug(objOrMsg: unknown, msg?: string): void {
    this.formatLog('debug', objOrMsg, msg);
  }

  trace(objOrMsg: unknown, msg?: string): void {
    this.formatLog('verbose', objOrMsg, msg); // Map trace to verbose
  }

  fatal(objOrMsg: unknown, msg?: string): void {
    this.formatLog('error', objOrMsg, msg); // Map fatal to error
  }

  silent(_objOrMsg: unknown, _msg?: string): void {
    // Silent mode: do nothing
    return;
  }

  child(bindings: Record<string, unknown>): FastifyBaseLogger {
    return new FastifyWinstonLogger(createChildLogger(bindings));
  }
}

export default FastifyWinstonLogger;
