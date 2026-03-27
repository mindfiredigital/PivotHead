/**
 * Logger for stackblitz-demo.
 * Uses Winston when running in Node.js (vite build). Falls back to
 * structured console logging in the browser.
 * Control log level via LOG_LEVEL env var (default: "info").
 */

const LABEL = 'pivothead-stackblitz-demo';

const LEVEL_ORDER = { error: 0, warn: 1, info: 2, debug: 3 };

function resolveLevel() {
  const envLevel =
    typeof process !== 'undefined' ? (process.env.LOG_LEVEL ?? 'info') : 'info';
  return LEVEL_ORDER[envLevel] ?? LEVEL_ORDER['info'];
}

function buildConsoleLogger() {
  const maxLevel = resolveLevel();
  const log = (method, lvl, msg, ...args) => {
    if ((LEVEL_ORDER[lvl] ?? 99) <= maxLevel) {
      method(`[${LABEL}] ${lvl.toUpperCase()}: ${msg}`, ...args);
    }
  };
  return {
    error: (msg, ...args) =>
      log(console.error.bind(console), 'error', msg, ...args),
    warn: (msg, ...args) =>
      log(console.warn.bind(console), 'warn', msg, ...args),
    info: (msg, ...args) =>
      log(console.info.bind(console), 'info', msg, ...args),
    debug: (msg, ...args) =>
      log(console.debug.bind(console), 'debug', msg, ...args),
  };
}

function buildWinstonLogger() {
  if (typeof window !== 'undefined') return null;
  try {
    const winston = require('winston');
    const { combine, label, colorize, printf, timestamp } = winston.format;
    const fmt = printf(
      ({ level, message, label: lbl, timestamp: ts, ...meta }) => {
        const metaStr = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : '';
        return `${ts} [${lbl}] ${level}: ${message}${metaStr}`;
      }
    );
    return winston.createLogger({
      level:
        (typeof process !== 'undefined' ? process.env.LOG_LEVEL : undefined) ??
        'info',
      format: combine(
        label({ label: LABEL }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        colorize({ all: false }),
        fmt
      ),
      transports: [new winston.transports.Console()],
    });
  } catch {
    return null;
  }
}

export const logger = buildWinstonLogger() ?? buildConsoleLogger();
