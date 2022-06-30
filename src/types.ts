import type { DMMF } from "@prisma/generator-helper"
import { Config } from "./config"
import { computeCustomSchema, computeModifiers } from "./docs"

export const getZodConstructor = (
  config: Config,
  field: DMMF.Field,
  getRelatedSchemaName = (name: string) => name,
) => {
  let zodType = "z.unknown()"
  const extraModifiers: string[] = [""]
  if (field.kind === "scalar") {
    switch (field.type) {
      case "String":
        zodType = "z.string()"
        break
      case "Int":
        zodType = "z.number()"
        extraModifiers.push("int()")
        break
      case "BigInt":
        zodType = "z.bigint()"
        break
      case "DateTime":
        zodType = "z.date()"
        break
      case "Float":
        zodType = "z.number()"
        break
      case "Decimal":
        zodType = config.decimalJs ? "decimalSchema" : "z.number()"
        break
      case "Json":
        zodType = "jsonSchema"
        break
      case "Boolean":
        zodType = "z.boolean()"
        break
      // TODO: Proper type for bytes fields
      case "Bytes":
        zodType = "z.unknown()"
        break
    }
  } else if (field.kind === "enum") {
    zodType = `z.nativeEnum(${field.type})`
  } else if (field.kind === "object") {
    zodType = getRelatedSchemaName(field.type.toString())
  }

  if (field.isList) extraModifiers.push("array()")
  if (field.documentation) {
    zodType = computeCustomSchema(field.documentation) ?? zodType
    extraModifiers.push(...computeModifiers(field.documentation))
  }
  if (!field.isRequired) extraModifiers.push("nullable()")

  return `${zodType}${extraModifiers.join(".")}`
}
