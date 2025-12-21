import { z } from 'zod'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export const diagnosePlantSchema = z.object({
  symptoms: z.string().optional(),
  image: z
    .custom<File>(
      (val) => val && typeof val === 'object' && val instanceof File,
      'Image file is required',
    )
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Image size exceeds 10MB limit')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Invalid image type. Supported: JPEG, PNG, WebP, HEIC',
    ),
})
