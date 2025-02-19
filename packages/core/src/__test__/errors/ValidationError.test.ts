import { ValidationError } from '../../errors/ErrorHandler';

describe('ValidationError', () => {
  it('should create a ValidationError with default code and statusCode', () => {
    const error = new ValidationError('Validation failed');

    expect(error.message).toBe('Validation failed');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
  });

  it('should allow custom code and metadata', () => {
    const error = new ValidationError(
      'Custom validation error',
      'CUSTOM_CODE',
      { field: 'email' }
    );

    expect(error.code).toBe('CUSTOM_CODE');
    expect(error.metadata).toEqual({ field: 'email' });
  });
});
