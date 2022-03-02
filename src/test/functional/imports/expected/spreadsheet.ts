import * as z from "zod"
import { CompletePresentation, RelatedPresentationModel } from "./index"

export const SpreadsheetModel = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: z.any(),
  created: z.date(),
  updated: z.date(),
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
