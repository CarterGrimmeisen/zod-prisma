import { DMMF } from '@prisma/generator-helper'
import { getZodConstructor } from '../src/types'

describe('types Package', () => {
	test('getZodConstructor', () => {
		const field: DMMF.Field = {
			hasDefaultValue: false,
			isGenerated: false,
			isId: false,
			isList: true,
			isRequired: false,
			isUnique: false,
			kind: 'scalar',
			name: 'nameList',
			type: 'String',
			documentation: ['@zod.max(64)', '@zod.min(1)'].join('\n'),
		}

		const constructor = getZodConstructor(field)

		expect(constructor).toBe('z.string().nullable().array().max(64).min(1)')
	})

	test('regression - unknown type', () => {
		const field: DMMF.Field = {
			hasDefaultValue: false,
			isGenerated: false,
			isId: false,
			isList: false,
			isRequired: true,
			isUnique: false,
			kind: 'scalar',
			name: 'aField',
			type: 'SomeUnknownType',
		}

		const constructor = getZodConstructor(field)

		expect(constructor).toBe('z.unknown()')
	})
})
