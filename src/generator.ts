import path from "path"
import { DMMF } from "@prisma/generator-helper"
import { ImportDeclarationStructure, SourceFile, StructureKind } from "ts-morph"
import { Config, PrismaOptions } from "./config"
import {
  dotSlash,
  needsRelatedSchema,
  schemaNameFormatter,
  writeArray,
} from "./util"
import {
  generateBaseSchema,
  generateCreateSchema,
  generateRelationsSchema,
  generateSchema,
  generateUpdateSchema,
} from "./schemas"

export const writeImportsForModel = (
  model: DMMF.Model,
  sourceFile: SourceFile,
  config: Config,
  { schemaPath, outputPath, clientPath }: PrismaOptions,
) => {
  const { schema, baseSchema } = schemaNameFormatter(config)
  const importList: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      namespaceImport: "z",
      moduleSpecifier: "zod",
    },
  ]

  if (config.imports) {
    importList.push({
      kind: StructureKind.ImportDeclaration,
      namespaceImport: "imports",
      moduleSpecifier: dotSlash(
        path.relative(
          outputPath,
          path.resolve(path.dirname(schemaPath), config.imports),
        ),
      ),
    })
  }

  if (config.decimalJs && model.fields.some((f) => f.type === "Decimal")) {
    importList.push({
      kind: StructureKind.ImportDeclaration,
      namedImports: ["Decimal"],
      moduleSpecifier: "decimal.js",
    })
  }

  const enumFields = model.fields.filter((f) => f.kind === "enum")
  const relationFields = model.fields.filter((f) => f.kind === "object")
  const relativePath = path.relative(outputPath, clientPath)

  if (enumFields.length > 0) {
    importList.push({
      kind: StructureKind.ImportDeclaration,
      isTypeOnly: enumFields.length === 0,
      moduleSpecifier: dotSlash(relativePath),
      namedImports: enumFields.map((f) => f.type),
    })
  }

  if (relationFields.length > 0) {
    const filteredFields = relationFields.filter((f) => f.type !== model.name)

    if (filteredFields.length > 0) {
      importList.push({
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier: "./index",
        namedImports: Array.from(
          new Set(
            filteredFields.flatMap((f) => [
              `${f.type}Relations`,
              schema(f.type),
              baseSchema(f.type),
            ]),
          ),
        ),
      })
    }
  }

  sourceFile.addImportDeclarations(importList)
}

export const writeTypeSpecificSchemas = (
  model: DMMF.Model,
  sourceFile: SourceFile,
  config: Config,
  _prismaOptions: PrismaOptions,
) => {
  if (model.fields.some((f) => f.type === "Json")) {
    sourceFile.addStatements((writer) => {
      writer.newLine()
      writeArray(writer, [
        "// Helper schema for JSON fields",
        `type Literal = boolean | number | string${
          config.prismaJsonNullability ? "" : "| null"
        }`,
        "type Json = Literal | { [key: string]: Json } | Json[]",
        `const literalSchema = z.union([z.string(), z.number(), z.boolean()${
          config.prismaJsonNullability ? "" : ", z.null()"
        }])`,
        "const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>",
        "  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),",
        ")",
      ])
    })
  }

  if (config.decimalJs && model.fields.some((f) => f.type === "Decimal")) {
    sourceFile.addStatements((writer) => {
      writer.newLine()
      writeArray(writer, [
        "// Helper schema for Decimal fields",
        "z",
        ".instanceof(Decimal)",
        ".or(z.string())",
        ".or(z.number())",
        ".refine((value) => {",
        "  try {",
        "    return new Decimal(value);",
        "  } catch (error) {",
        "    return false;",
        "  }",
        "})",
        ".transform((value) => new Decimal(value));",
      ])
    })
  }
}

export const populateModelFile = (
  model: DMMF.Model,
  sourceFile: SourceFile,
  config: Config,
  prismaOptions: PrismaOptions,
) => {
  writeImportsForModel(model, sourceFile, config, prismaOptions)
  writeTypeSpecificSchemas(model, sourceFile, config, prismaOptions)

  generateBaseSchema(model, sourceFile, config, prismaOptions)
  if (needsRelatedSchema(model))
    generateRelationsSchema(model, sourceFile, config, prismaOptions)

  generateSchema(model, sourceFile, config, prismaOptions)
  generateCreateSchema(model, sourceFile, config, prismaOptions)
  generateUpdateSchema(model, sourceFile, config, prismaOptions)
}

export const generateBarrelFile = (
  models: DMMF.Model[],
  indexFile: SourceFile,
) => {
  models.forEach((model) =>
    indexFile.addExportDeclaration({
      moduleSpecifier: `./${model.name.toLowerCase()}`,
    }),
  )
}
