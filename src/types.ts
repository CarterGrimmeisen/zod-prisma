import type { DMMF } from '@prisma/generator-helper'
import { computeModifiers } from './docs'

export const getZodConstructor = (
	field: DMMF.Field,
	getRelatedModelName = (
		name: string | DMMF.SchemaEnum | DMMF.OutputType | DMMF.SchemaArg
	) => name.toString()
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
			case 'Bytes':
				zodType = 'z.unknown()'
				break
		}
	} else if (field.kind === 'enum') {
		zodType = `z.nativeEnum(${field.type})`
	} else if (field.kind === 'object') {
		zodType = getRelatedModelName(field.type)
	}

	if (!field.isRequired) extraModifiers.push('nullable()')
	if (field.isList) extraModifiers.push('array()')
	if (field.documentation) {
		extraModifiers.push(...computeModifiers(field.documentation))
	}

	return `${zodType}${extraModifiers.join('.')}`
}
