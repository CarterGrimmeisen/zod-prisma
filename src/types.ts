import type { DMMF } from '@prisma/generator-helper'
import { computeCustomSchema, computeModifiers } from './docs'

export const getZodConstructor = (
	field: DMMF.Field,
	getRelatedModelName = (name: string | DMMF.SchemaEnum | DMMF.OutputType | DMMF.SchemaArg) =>
		name.toString()
) => {
	let zodType = 'z.unknown()'
	let extraModifiers: string[] = ['']
	if (field.kind === 'scalar') {
		switch (field.type) {
			case 'String':
				zodType = 'z.string()'
				break
			case 'Int':
				zodType = 'z.number()'
				extraModifiers.push('int()')
				break
			case 'BigInt':
				zodType = 'z.bigint()'
				break
			case 'DateTime':
				zodType = 'z.date()'
				break
			case 'Float':
				zodType = 'z.number()'
				break
			case 'Decimal':
				zodType = 'z.number()'
				break
			case 'Json':
				zodType = 'jsonSchema'
				break
			case 'Boolean':
				zodType = 'z.boolean()'
				break
			// TODO: Proper type for bytes fields
			case 'Bytes':
				zodType = 'z.unknown()'
				break
		}
	} else if (field.kind === 'enum') {
		zodType = `z.nativeEnum(${field.type})`
	} else if (field.kind === 'object') {
		zodType = getRelatedModelName(field.type)
	}

	if (field.isList) extraModifiers.push('array()')
	if (field.documentation) {
		zodType = computeCustomSchema(field.documentation) ?? zodType
		extraModifiers.push(...computeModifiers(field.documentation))
	}
	if (!field.isRequired && field.type !== 'Json') extraModifiers.push('nullish()')
	// if (field.hasDefaultValue) extraModifiers.push('optional()')

	return `${zodType}${extraModifiers.join('.')}`
}
