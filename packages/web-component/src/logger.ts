/**
 * Logger for @mindfiredigital/pivothead-web-component.
 *
 * Browser-only package — uses a structured console-based logger.
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

function resolveLevel(): number {
  const envLevel =
    typeof process !== 'undefined'
      ? (process.env['LOG_LEVEL'] ?? 'info')
      : 'info';
  return LEVEL_ORDER[envLevel] ?? (LEVEL_ORDER['info'] as number);
}

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

export const logger: PivotLogger = {
  error: (msg, ...args) =>
    log(console.error.bind(console), 'error', msg, ...args),
  warn: (msg, ...args) => log(console.warn.bind(console), 'warn', msg, ...args),
  info: (msg, ...args) => log(console.info.bind(console), 'info', msg, ...args),
  debug: (msg, ...args) =>
    log(console.debug.bind(console), 'debug', msg, ...args),
};
