import { z } from 'zod'
import { uuidSchema } from './common.validator.js'

export const getProfileSchema = z.object({
  id: uuidSchema,
})
