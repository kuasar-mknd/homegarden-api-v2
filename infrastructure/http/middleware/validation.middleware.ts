import { zValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import type { ZodSchema } from 'zod'

/**
 * Validation Middleware Wrapper
 *
 * Wraps @hono/zod-validator to provide a standardized error response format.
 * Returns a 400 Bad Request with a structured error object if validation fails.
 *
 * @param target - The part of the request to validate ('json', 'query', 'param', etc.)
 * @param schema - The Zod schema to validate against
 */
export const validate = <T extends keyof ValidationTargets>(
  target: T,
  schema: ZodSchema,
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        },
        400,
      )
    }
  })
