# Error Handling

This document outlines the error-handling strategy and custom error classes used in the project.

## Overview

Custom error classes are implemented to standardize error management across the application. These errors ensure consistency, improve debuggability, and provide structured information for error logging and handling.

## Error Classes

### BaseError

The parent class for all custom errors. It includes:

- `message`: A descriptive error message.
- `code`: A unique error code.
- `statusCode`: HTTP status code or general numeric code.
- `metadata`: Additional context for the error.

### ValidationError

A subclass of `BaseError` for input validation errors.

- Default `code`: `VALIDATION_ERROR`
- Default `statusCode`: `400`

### InternalError

A subclass of `BaseError` for internal application errors.

- Default `code`: `INTERNAL_ERROR`
- Default `statusCode`: `500`

## Usage

Example of throwing and catching a `ValidationError`:

```typescript
import { ValidationError } from '../core/errors/ValidationError';

try {
  throw new ValidationError('Invalid input data', 'INVALID_INPUT', {
    field: 'email',
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.message); // "Invalid input data"
    console.error(error.metadata); // { field: 'email' }
  }
}
```

## Testing

All error classes are tested under `src/__test__/errors/`.

- `BaseError.test.ts`
- `ValidationError.test.ts`
- `InternalError.test.ts`

Run tests using:

```bash
npm test
```
