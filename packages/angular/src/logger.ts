/**
 * Logger for @mindfiredigital/pivothead-angular.
 *
 * Uses Winston when running in Node.js (CJS context). Falls back to a
 * structured console-based logger in browser / ESM environments so the
 * package stays bundle-safe and works without winston installed.
 *
 * Log level is controlled by the LOG_LEVEL environment variable
 * (default: "info"). Accepted values: error | warn | info | debug.
 */

import { LOGGER_LABEL } from './constants.js';

const LABEL = LOGGER_LABEL;

type LogMethod = (message: string, ...meta: unknown[]) => void;

export interface PivotLogger {
  error: LogMethod;
  warn: LogMethod;
  info: LogMethod;
  debug: LogMethod;
}

const LEVEL_ORDER: Record<string, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Minimal type surface needed from Winston — avoids installing @types/winston
// or importing winston types at build time.
interface WinstonModule {
  createLogger: (opts: {
    level?: string;
    format?: unknown;
    transports?: unknown[];
  }) => PivotLogger;
  format: {
    combine: (...args: unknown[]) => unknown;
    label: (opts: { label: string }) => unknown;
    colorize: (opts?: { all?: boolean }) => unknown;
    printf: (fn: (info: Record<string, unknown>) => string) => unknown;
    timestamp: (opts?: { format?: string }) => unknown;
  };
  transports: {
    Console: new () => unknown;
  };
}

function resolveLevel(): number {
  const envLevel =
    typeof process !== 'undefined'
      ? (process.env['LOG_LEVEL'] ?? 'info')
      : 'info';
  return LEVEL_ORDER[envLevel] ?? (LEVEL_ORDER['info'] as number);
}

function buildConsoleLogger(): PivotLogger {
  const maxLevel = resolveLevel();

  const log = (
    method: (...args: unknown[]) => void,
    lvl: string,
    msg: string,
    ...args: unknown[]
  ): void => {
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

function buildWinstonLogger(): PivotLogger | null {
  // Only attempt Winston in a Node.js / CJS context.
  // In browser or ESM, 'require' is undefined — caught below.
  if (typeof window !== 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const winston = (require as (id: string) => WinstonModule)('winston');
    const { combine, label, colorize, printf, timestamp } = winston.format;

    const fmt = printf(
      ({
        level,
        message,
        label: lbl,
        timestamp: ts,
        ...meta
      }: Record<string, unknown>) => {
        const metaStr = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : '';
        return `${String(ts)} [${String(lbl)}] ${String(level)}: ${String(message)}${metaStr}`;
      }
    );

    return winston.createLogger({
      level:
        (typeof process !== 'undefined'
          ? process.env['LOG_LEVEL']
          : undefined) ?? 'info',
      format: combine(
        label({ label: LABEL }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        colorize({ all: false }),
        fmt
      ),
      transports: [new winston.transports.Console()],
    });
  } catch {
    return null; // winston not installed or require not available (ESM)
  }
}

export const logger: PivotLogger = buildWinstonLogger() ?? buildConsoleLogger();
