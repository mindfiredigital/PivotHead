import { InternalError } from '../../errors/ErrorHandler';

describe('InternalError', () => {
  it('should create an InternalError with default code and statusCode', () => {
    const error = new InternalError('Internal server error');

    expect(error.message).toBe('Internal server error');
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.statusCode).toBe(500);
  });

  it('should allow custom code and metadata', () => {
    const error = new InternalError(
      'Custom internal error',
      'CUSTOM_INTERNAL',
      { service: 'auth' },
    );

    expect(error.code).toBe('CUSTOM_INTERNAL');
    expect(error.metadata).toEqual({ service: 'auth' });
  });
});
