import * as z from 'zod'

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

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

export const SpreadsheetModel = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: jsonSchema,
  created: dateSchema,
  updated: dateSchema,
})
