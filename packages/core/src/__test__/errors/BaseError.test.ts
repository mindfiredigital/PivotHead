import { BaseError } from "../../errors/ErrorHandler";

describe('BaseError', () => {
    it('should create a BaseError with correct properties', () => {
      const error = new BaseError('Test error', 'TEST_ERROR', 400, { detail: 'Some metadata' });
  
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.metadata).toEqual({ detail: 'Some metadata' });
    });
  
    it('should capture stack trace', () => {
      const error = new BaseError('Stack trace test', 'STACK_TEST', 500);
  
      expect(error.stack).toContain('BaseError');
    });
  });