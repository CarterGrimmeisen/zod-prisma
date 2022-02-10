import { DMMF } from "@prisma/generator-helper"
import { SourceFile, VariableDeclarationKind } from "ts-morph"
import { Config, PrismaOptions } from "./config"
import { getJSDocs } from "./docs"
import { getZodConstructor } from "./types"
import { needsRelatedSchema, schemaNameFormatter, writeArray } from "./util"

export const generateBaseSchema = (
  model: DMMF.Model,
  sourceFile: SourceFile,
  config: Config,
  _prismaOptions: PrismaOptions,
) => {
  const { baseSchema } = schemaNameFormatter(config)

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    leadingTrivia: (writer) => writer.blankLineIfLastNot(),
    declarations: [
      {
        name: baseSchema(model.name),
        initializer: (writer) =>
          writer
            .write("z.object(")
            .inlineBlock(() => {
              model.fields
                .filter((f) => f.kind !== "object")
                .forEach((field) => {
                  writeArray(writer, getJSDocs(field.documentation))
                  writer
                    .write(`${field.name}: ${getZodConstructor(field)}`)
                    .write(",")
                    .newLine()
                })
            })
            .write(")"),
      },
    ],
  })
}

export const generateRelationsSchema = (
  model: DMMF.Model,
  sourceFile: SourceFile,
  config: Config,
  _prismaOptions: PrismaOptions,
) => {
  const { schema, relationsSchema, baseSchema } = schemaNameFormatter(config)

  const relationFields = model.fields.filter((f) => f.kind === "object")

  sourceFile.addInterface({
    name: `${model.name}Relations`,
    isExported: true,
    leadingTrivia: (writer) => writer.blankLineIfLastNot(),
    properties: relationFields.map((f) => ({
      hasQuestionToken: !f.isRequired,
      name: f.name,
      type: (writer) => {
        let type = `z.infer<typeof ${baseSchema(f.type)}> & ${f.type}Relations`

        if (f.isList || !f.isRequired) type = `(${type})`
        if (f.isList) type = `${type}[]`
        if (!f.isRequired) type = `${type} | null`

        writer.write(type)
      },
    })),
  })

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    leadingTrivia: (writer) => writer.blankLineIfLastNot(),
    declarations: [
      {
        name: relationsSchema(model.name),
        type: [
          "z.ZodObject<{",
          `  [K in keyof ${model.name}Relations]-?: z.ZodType<${model.name}Relations[K]>`,
          "}>",
        ].join("\n"),
        initializer: (writer) => {
          writer
            .write("z.object(")
            .inlineBlock(() => {
              relationFields.forEach((field) => {
                writeArray(writer, getJSDocs(field.documentation))
                writer.writeLine(
                  `${field.name}: ${getZodConstructor(
                    field,
                    (type: string) => `z.lazy(() => ${schema(type)})`,
                  )},`,
                )
              })
            })
            .write(")")
        },
      },
    ],
  })
}

export const generateSchema = (
  model: DMMF.Model,
  sourceFile: SourceFile,
  config: Config,
  _prismaOptions: PrismaOptions,
) => {
  const { schema, baseSchema, relationsSchema } = schemaNameFormatter(config)

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    leadingTrivia: (writer) => writer.blankLineIfLastNot(),
    declarations: [
      {
        name: schema(model.name),
        initializer:
          `${baseSchema(model.name)}` +
          (needsRelatedSchema(model)
            ? `.merge(${relationsSchema(model.name)})`
            : ""),
      },
    ],
  })
}

export const generateCreateSchema = (
  model: DMMF.Model,
  sourceFile: SourceFile,
  config: Config,
  _prismaOptions: PrismaOptions,
) => {
  const { schema, createSchema } = schemaNameFormatter(config)

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    leadingTrivia: (writer) => writer.blankLineIfLastNot(),
    declarations: [
      {
        name: createSchema(model.name),
        initializer: (writer) => {
          writer.write(`${schema(model.name)}`)

          const partialFields = model.fields.filter(
            (field) =>
              field.hasDefaultValue ||
              !field.isRequired ||
              field.isGenerated ||
              field.isUpdatedAt ||
              field.isList ||
              model.fields.find((f) =>
                f.relationFromFields?.includes(field.name),
              ),
          )

          if (partialFields) {
            writer.write(`.partial(`).inlineBlock(() => {
              partialFields.forEach((field) => {
                writer.writeLine(`${field.name}: true,`)
              })
            })
          }

          writer.write(")")
        },
      },
    ],
  })
}

export const generateUpdateSchema = (
  model: DMMF.Model,
  sourceFile: SourceFile,
  config: Config,
  _prismaOptions: PrismaOptions,
) => {
  const { schema, updateSchema } = schemaNameFormatter(config)

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    leadingTrivia: (writer) => writer.blankLineIfLastNot(),
    declarations: [
      {
        name: updateSchema(model.name),
        initializer: `${schema(model.name)}.partial()`,
      },
    ],
  })
}
