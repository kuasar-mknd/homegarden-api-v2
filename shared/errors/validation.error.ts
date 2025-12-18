/**
 * Validation Error
 */

import { AppError } from './app-error.js'

export interface ValidationIssue {
  field: string
  message: string
  code?: string
}

export class ValidationError extends AppError {
  public readonly issues: ValidationIssue[]

  constructor(issues: ValidationIssue[]) {
    super('Validation failed', 422, 'VALIDATION_ERROR')
    this.issues = issues
  }

  static fromZodError(zodError: { errors: Array<{ path: (string | number)[]; message: string; code: string }> }): ValidationError {
    const issues = zodError.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))
    return new ValidationError(issues)
  }

  toJSON() {
    return {
      success: false,
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
      issues: this.issues,
    }
  }
}
