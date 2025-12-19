/**
 * Not Found Error
 */

import { AppError } from './app-error.js'

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`
    super(message, 404, 'NOT_FOUND')
  }
}
