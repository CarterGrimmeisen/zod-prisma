import * as z from 'zod'

// Helper schema for DateTime fields
const dateSchema = z
  .instanceof(Date)
  .or(z.string())
  .refine((value) => {
    try {
      return !isNaN(new Date(value).getTime())
    } catch (error) {
      return false
    }
  })
  .transform((value) => new Date(value)) as z.ZodEffects<
    z.ZodEffects<
      z.ZodType<Date, z.ZodTypeDef, Date>,
      Date,
      Date
    >,
    Date,
    Date
  >

export const DocumentModel = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: z.string(),
  created: dateSchema,
  updated: dateSchema,
})
