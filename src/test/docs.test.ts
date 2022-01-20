import { computeCustomSchema, computeModifiers, getJSDocs } from '../docs'

describe('docs Package', () => {
	test('computeModifiers', () => {
		const modifiers = computeModifiers(`
			@zod.email().optional()
			@zod.url()
			@zod.uuid()
			@zod.min(12)
			@zod.refine((val) => val !== 14)
			Banana
			@example something something
    `)

		expect(modifiers).toStrictEqual([
			'email()',
			'optional()',
			'url()',
			'uuid()',
			'min(12)',
			'refine((val) => val !== 14)',
		])
	})

	test('Regression #86', () => {
		const customSchema = computeCustomSchema(`
			@zod.custom(z.string().min(1).refine((val) => isURL(val)))
    `)

		expect(customSchema).toBe('z.string().min(1).refine((val) => isURL(val))')
	})

	test('getJSDocs', () => {
		const docLines = getJSDocs(
			['This is something', 'How about something else', '@something', '@example ur mom'].join(
				'\n'
			)
		)

		expect(docLines.length).toBe(6)
		expect(docLines).toStrictEqual([
			'/**',
			' * This is something',
			' * How about something else',
			' * @something',
			' * @example ur mom',
			' */',
		])
	})
})
