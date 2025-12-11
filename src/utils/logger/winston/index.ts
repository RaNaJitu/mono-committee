import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

let baseLogger: winston.Logger;
const logDirectory = path.resolve(__dirname, '..', '..', '..', '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Safe stringify function to handle circular references and preserve arrays ( tested )
function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (value && typeof value === 'object') {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    },
    2 // Pretty-print with indentation
  );
}


// Shared formatter function
const formatter = winston.format.printf(({ level, message, timestamp, reqId, ...meta }) => {
  const reqIdStr = reqId ? `| ${reqId}` : ''; // Include reqId if present
  const splat = meta[Symbol.for('splat')] as unknown[] | undefined;
  let metaStr: string = '';

  if (splat && splat.length > 0) {
    if (splat.length === 1) {
      const singleMeta = splat[0];
      if (singleMeta instanceof Error) {
        metaStr = `\n${singleMeta.stack}`; // Include full stack trace for errors
      } else if (Array.isArray(singleMeta) || typeof singleMeta === 'object') {
        metaStr = safeStringify(singleMeta); // Properly serialize arrays/objects
      } else {
        metaStr = String(singleMeta); // Log all other values as strings (including `0`, `false`, etc.)
      }
    } else {
      metaStr = safeStringify(splat); // Serialize multiple splat elements
    }
  } else if (Object.keys(meta).length > 0) {
    metaStr = safeStringify(meta); // Ensure all metadata is serialized
  }

  return `${timestamp} [${level} ${reqIdStr}]: ${message} ${metaStr ? `${metaStr}` : ''}`;
})
// Create the base logger
baseLogger = winston.createLogger({
  level: 'info', // Set the log level
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), // Human-readable timestamp
    formatter
  ),
  transports: [
    // Console transport for colorized logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        formatter
      ),
    }),
    // Daily Rotate File transport for JSON logs
    new DailyRotateFile({
      filename: path.join(logDirectory, 'output-%DATE%.log'),
      datePattern: 'YYYY-MM-DD', // Rotate files daily
      zippedArchive: false, // Compress old logs
      maxSize: '50m', // Maximum size of each log file
      maxFiles: '7d', // Retain logs for 14 days
    }),
  ],
});

baseLogger.info("Logger Initialized");
baseLogger.info(`Logs Directory: [${logDirectory}]`);

// Function to create a child logger
export const createChildLogger = (metadata: Record<string, any>) => baseLogger.child(metadata);
export default baseLogger;

