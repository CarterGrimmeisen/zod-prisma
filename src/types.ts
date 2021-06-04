import { DMMF } from '@prisma/generator-helper'
import { computeModifiers } from './docs'

export const getZodConstructor = (field: DMMF.Field) => {
  let zodType = 'unknown()'
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
      case 'DateTime':
        zodType = 'z.date()'
        break
      case 'Float':
        zodType = 'z.number()'
        break
      case 'Json':
        zodType = 'z.any()'
        break
      case 'Boolean':
        zodType = 'z.boolean()'
        break
    }
  } else if (field.kind === 'enum') {
    zodType = `z.nativeEnum(${field.type})`
  } else if (field.kind === 'object') {
    zodType = `Related${field.type}Model`
  }

  if (!field.isRequired) extraModifiers.push('nullable()')
  if (field.isList) extraModifiers.push('array()')
  if (field.documentation) {
    extraModifiers.push(...computeModifiers(field.documentation))
  }

  return `${zodType}${extraModifiers.join('.')}`
}
