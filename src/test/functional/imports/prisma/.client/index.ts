/**
 * Utility Types
 */

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON object.
 * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from.
 */
export type JsonObject = { [Key in string]?: JsonValue }

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON array.
 */
export interface JsonArray extends Array<JsonValue> {}

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches any valid JSON value.
 */
export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

/**
 * Model Document
 *
 */
export type Document = {
	id: string
	filename: string
	author: string
	contents: string
	status: Status
	created: Date
	updated: Date
}

/**
 * Model Presentation
 *
 */
export type Presentation = {
	id: string
	filename: string
	author: string
	contents: string[]
	created: Date
	updated: Date
}

/**
 * Model Spreadsheet
 *
 */
export type Spreadsheet = {
	id: string
	filename: string
	author: string
	contents: JsonValue
	created: Date
	updated: Date
}

/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const Status = {
	draft: 'draft',
	live: 'live',
	archived: 'archived',
}

export type Status = (typeof Status)[keyof typeof Status]
