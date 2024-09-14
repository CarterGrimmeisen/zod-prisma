import * as z from 'zod'
import { CompletePresentation, RelatedPresentationModel } from './index'

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

export interface CompleteSpreadsheet extends z.infer<typeof SpreadsheetModel> {
  presentations: CompletePresentation[]
}

/**
 * RelatedSpreadsheetModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSpreadsheetModel: z.ZodSchema<CompleteSpreadsheet> = z.lazy(() => SpreadsheetModel.extend({
  presentations: RelatedPresentationModel.array(),
}))
