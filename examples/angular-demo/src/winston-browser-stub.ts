/**
 * Browser-safe no-op stub for winston.
 * Aliased via tsconfig paths so Angular's esbuild never tries to resolve
 * the real winston (which requires Node.js built-ins like util, os, http).
 * The pivothead packages fall back to their console-based logger when
 * winston.createLogger throws or is unavailable.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const noop = () => undefined;

export const format = {
  combine: noop,
  label: noop,
  colorize: noop,
  printf: noop,
  timestamp: noop,
  json: noop,
  simple: noop,
  errors: noop,
  splat: noop,
  prettyPrint: noop,
  metadata: noop,
  ms: noop,
};

export class Console {
  /* stub transport */
}

export const transports = { Console };

export const createLogger = (): any => {
  throw new Error('winston is not available in browser context');
};

export const addColors = noop;

export default { createLogger, format, transports, addColors };
