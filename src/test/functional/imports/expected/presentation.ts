import * as z from 'zod'
import { CompleteSpreadsheet, RelatedSpreadsheetModel } from './index'

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

export const PresentationModel = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: z.string().array(),
  created: dateSchema,
  updated: dateSchema,
})

export interface CompletePresentation extends z.infer<typeof PresentationModel> {
  spreadsheets: CompleteSpreadsheet[]
}

/**
 * RelatedPresentationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPresentationModel: z.ZodSchema<CompletePresentation> = z.lazy(() => PresentationModel.extend({
  spreadsheets: RelatedSpreadsheetModel.array(),
}))
