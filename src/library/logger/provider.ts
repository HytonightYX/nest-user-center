import { pathConstant } from '@common/constant';
import { ConfigProvider } from '@library/configs';
import { Injectable, LoggerService } from '@nestjs/common';
import { Logform, Logger, createLogger, format, LoggerOptions, transports } from 'winston';

/**
 * Use Winston as the default logging processor for your project
 */
@Injectable()
export class LoggerProvider implements LoggerService {
  /**
   * Winston logger
   */
  private readonly instance: Logger;

  /**
   * Constructor
   */
  public constructor(private readonly configs: ConfigProvider) {
    this.instance = createLogger(this.getOptions());
  }

  /**
   * Log output method
   */
  public log = (message: string) => this.instance.info(message);
  public info = (message: string) => this.instance.info(message);
  public warn = (message: string) => this.instance.warn(message);
  public debug = (message: string) => this.instance.debug(message);
  public error = (message: string) => this.instance.error(message);

  /**
   * Formatted print output
   */
  private format(info: Logform.TransformableInfo) {
    const pid = process.pid;
    const message = info.message;
    const timestamp = info.timestamp;
    const env = this.configs.info.env;
    const appName = this.configs.info.appName;
    const level = info.level.toLocaleUpperCase();

    return `[${appName}] ${pid} - ${timestamp} [${env}] ${level}: ${message}`;
  }

  /**
   * Get Winston configuration information
   */
  private getOptions(): LoggerOptions {
    const dirname = pathConstant.logs;

    return {
      level: 'debug', // Only log less than the DEBUG level.
      exitOnError: false,
      handleExceptions: true,
      exceptionHandlers: new transports.File({ dirname, filename: 'stderr.log' }),
      transports: [
        new transports.Console({
          silent: !this.configs.info.enableConsoleLoging,
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(message => this.format(message)),
            format.colorize({ all: true }),
          ),
        }),
        new transports.File({
          silent: !this.configs.info.enableFileLoging,
          dirname,
          level: 'info',
          filename: 'stdout.log',
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(message => this.format(message)),
          ),
        }),
        new transports.File({
          silent: !this.configs.info.enableFileLoging,
          dirname,
          level: 'error',
          filename: 'stderr.log',
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(message => this.format(message)),
          ),
        }),
      ],
    };
  }
}
