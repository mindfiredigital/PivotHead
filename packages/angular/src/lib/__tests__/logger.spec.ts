import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// In jsdom (browser), window is defined so buildWinstonLogger() returns null
// and the module always exports a console-based logger here.
import { logger } from '../../logger';

describe('logger (console-based fallback in jsdom/browser)', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Interface compliance ─────────────────────────────────────────────────────

  describe('interface compliance', () => {
    it('exposes an error method', () => {
      expect(typeof logger.error).toBe('function');
    });

    it('exposes a warn method', () => {
      expect(typeof logger.warn).toBe('function');
    });

    it('exposes an info method', () => {
      expect(typeof logger.info).toBe('function');
    });

    it('exposes a debug method', () => {
      expect(typeof logger.debug).toBe('function');
    });
  });

  // ── Message formatting ───────────────────────────────────────────────────────

  describe('message formatting', () => {
    it('includes the package label in error output', () => {
      logger.error('something failed');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('@mindfiredigital/pivothead-angular')
      );
    });

    it('includes "ERROR" in error output', () => {
      logger.error('oops');
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('ERROR'));
    });

    it('includes "WARN" in warn output', () => {
      logger.warn('low memory');
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('WARN'));
    });

    it('includes "INFO" in info output', () => {
      logger.info('started');
      expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('INFO'));
    });

    it('includes the message text in the output', () => {
      logger.info('pivot initialised');
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('pivot initialised')
      );
    });

    it('forwards extra meta arguments to the underlying console call', () => {
      const meta = { field: 'revenue', value: 42 };
      logger.error('with meta', meta);
      expect(errorSpy).toHaveBeenCalledWith(expect.any(String), meta);
    });

    it('forwards multiple meta arguments to the underlying console call', () => {
      logger.warn('multi meta', 'arg1', 'arg2');
      expect(warnSpy).toHaveBeenCalledWith(expect.any(String), 'arg1', 'arg2');
    });
  });

  // ── Log level filtering (default level: info) ────────────────────────────────

  describe('log level filtering at default "info" level', () => {
    it('logs error messages', () => {
      logger.error('critical issue');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('logs warn messages', () => {
      logger.warn('caution');
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('logs info messages', () => {
      logger.info('all good');
      expect(infoSpy).toHaveBeenCalledTimes(1);
    });

    it('suppresses debug messages', () => {
      logger.debug('verbose detail');
      expect(debugSpy).not.toHaveBeenCalled();
    });
  });

  // ── Each level uses the correct console method ───────────────────────────────

  describe('console method routing', () => {
    it('routes error() to console.error', () => {
      logger.error('err');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it('routes warn() to console.warn', () => {
      logger.warn('wrn');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it('routes info() to console.info', () => {
      logger.info('inf');
      expect(infoSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
