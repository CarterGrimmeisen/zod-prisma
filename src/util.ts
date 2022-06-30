import type { DMMF } from "@prisma/generator-helper"
import type { CodeBlockWriter } from "ts-morph"
import { Config } from "./config"

export const writeArray = (
  writer: CodeBlockWriter,
  array: string[],
  newLine = true,
) => array.forEach((line) => writer.write(line).conditionalNewLine(newLine))

export const schemaNameFormatter = ({ schemaCase, schemaSuffix }: Config) => {
  const formatter = (name: string) => {
    if (schemaCase === "camelCase") {
      name = name.slice(0, 1).toLowerCase() + name.slice(1)
    }
    return `${name}${schemaSuffix}`
  }

  return {
    baseSchema: (name: string) => formatter(`${name}Base`),
    schema: (name: string) => formatter(name),
    relationsSchema: (name: string) => formatter(`${name}Relations`),
    createSchema: (name: string) => formatter(`${name}Create`),
    updateSchema: (name: string) => formatter(`${name}Update`),
    enumSchema: (name: string) => formatter(name),
  }
}

export const needsRelatedSchema = (model: DMMF.Model, config: Config) =>
  model.fields.some((field) => field.kind === "object") &&
  !config.excludeRelations

// Too lazy to figure out why unknown[] here causes type errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const chunk = <T extends any[]>(input: T, size: number): T[] => {
  return input.reduce(
    (arr, item, idx) =>
      idx % size === 0
        ? [...arr, [item]]
        : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]],
    [],
  )
}
