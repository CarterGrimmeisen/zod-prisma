import * as z from 'zod'
import { CompleteSpreadsheet, RelatedSpreadsheetModel } from './index'

export const PresentationModel = z.object({
	id: z.string(),
	filename: z.string(),
	author: z.string(),
	contents: z.string().array(),
	created: z.date(),
	updated: z.date(),
})

export interface CompletePresentation extends z.infer<typeof PresentationModel> {
	spreadsheets: CompleteSpreadsheet[]
}

/**
 * RelatedPresentationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPresentationModel: z.ZodSchema<CompletePresentation> = z.lazy(() =>
	PresentationModel.extend({
		spreadsheets: RelatedSpreadsheetModel.array(),
	})
)
