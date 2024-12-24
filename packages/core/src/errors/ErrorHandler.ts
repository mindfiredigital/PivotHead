export class BaseError extends Error {
  public code: string;
  public statusCode: number;
  public metadata: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    metadata: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(
    message: string,
    code = 'VALIDATION_ERROR',
    metadata: Record<string, unknown> = {},
  ) {
    super(message, code, 400, metadata);
  }
}

export class InternalError extends BaseError {
  constructor(
    message: string,
    code = 'INTERNAL_ERROR',
    metadata: Record<string, unknown> = {},
  ) {
    super(message, code, 500, metadata);
  }
}
