import { computeModifiers, getJSDocs } from '../src/docs'

describe('docs Package', () => {
	test('computeModifiers', () => {
		const modifiers = computeModifiers(`
			@zod.email()
			@zod.url()
			@zod.uuid()
			Banana
			@example something something
    `)

		expect(modifiers.length).toBe(3)
		expect(modifiers).toStrictEqual(['email()', 'url()', 'uuid()'])
	})

	test('getJSDocs', () => {
		const docLines = getJSDocs(
			[
				'This is something',
				'How about something else',
				'@something',
				'@example ur mom',
			].join('\n')
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
