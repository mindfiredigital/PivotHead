'use strict';
/**
 * Winston logger for node-server-demo.
 * Falls back to structured console logging if winston is not installed.
 * Install winston: npm install winston
 * Control log level via LOG_LEVEL env var (default: "info").
 */

const LABEL = 'pivothead-node-server-demo';
const LEVEL_ORDER = { error: 0, warn: 1, info: 2, debug: 3 };

function resolveLevel() {
  return LEVEL_ORDER[process.env.LOG_LEVEL ?? 'info'] ?? LEVEL_ORDER['info'];
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
      level: process.env.LOG_LEVEL ?? 'info',
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

const logger = buildWinstonLogger() ?? buildConsoleLogger();
module.exports = { logger };
