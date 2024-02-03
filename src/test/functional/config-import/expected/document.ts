import * as z from 'zod'
import * as imports from '../prisma/zod-utils'

export const DocumentModel = z.object({
	id: z.string(),
	filename: z.string(),
	author: z.string(),
	contents: z.string(),
	size: imports.decimalSchema,
	created: z.date(),
	updated: z.date(),
})
