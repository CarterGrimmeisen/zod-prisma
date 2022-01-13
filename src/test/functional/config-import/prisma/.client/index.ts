import { Decimal } from 'decimal.js'

/**
 * Model Document
 *
 */
export type Document = {
	id: string
	filename: string
	author: string
	contents: string
	/**
	 * @zod.custom(imports.decimalSchema)
	 */
	size: Decimal
	created: Date
	updated: Date
}
