import type { DMMF } from "@prisma/generator-helper"
import path from "path"
import { ImportDeclarationStructure, SourceFile, StructureKind } from "ts-morph"
import type { Config, PrismaOptions } from "./config"
import {
  generateBaseSchema,
  generateCreateSchema,
  generateRelationsSchema,
  generateSchema,
  generateUpdateSchema,
} from "./schemas"
import {
  dotSlash,
  needsRelatedSchema,
  schemaNameFormatter,
  writeArray,
} from "./util"

export const writeImportsForModel = (
  model: DMMF.Model,
  sourceFile: SourceFile,
  config: Config,
  { schemaPath, outputPath, clientPath }: PrismaOptions,
) => {
  const { baseSchema, relationsSchema } = schemaNameFormatter(config)
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
  const relativePath = path.relative(
    outputPath,
    path.join(
      clientPath,
      config.nodeEsModules && !clientPath.includes("node_modules")
        ? "index.js"
        : "",
    ),
  )

  if (enumFields.length > 0) {
    importList.push({
      kind: StructureKind.ImportDeclaration,
      isTypeOnly: enumFields.length === 0,
      moduleSpecifier: dotSlash(relativePath),
      ...(config.nodeEsModules
        ? {
            namespaceImport: "Prisma",
          }
        : {
            namedImports: enumFields.map((f) => f.type),
          }),
    })
  }

  if (needsRelatedSchema(model, config)) {
    const relationFields = model.fields.filter((f) => f.kind === "object")

    const filteredFieldTypes = Array.from(
      new Set(
        relationFields.filter((f) => f.type !== model.name).map((f) => f.type),
      ),
    )

    if (filteredFieldTypes.length > 0) {
      filteredFieldTypes.forEach((type) => {
        importList.push({
          kind: StructureKind.ImportDeclaration,
          moduleSpecifier: `./${type.toLowerCase()}${
            config.nodeEsModules ? ".js" : ""
          }`,
          namedImports: [
            `${type}Relations`,
            relationsSchema(type),
            baseSchema(type),
          ],
        })
      })
    }
  }

  sourceFile.addImportDeclarations(importList)

  if (config.nodeEsModules && enumFields.length > 0) {
    sourceFile.addStatements((writer) => {
      writer.write(
        `const { ${enumFields.map((e) => e.type).join(", ")} } = Prisma;`,
      )
    })
  }
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
  if (needsRelatedSchema(model, config))
    generateRelationsSchema(model, sourceFile, config, prismaOptions)

  generateSchema(model, sourceFile, config, prismaOptions)
  generateCreateSchema(model, sourceFile, config, prismaOptions)
  generateUpdateSchema(model, sourceFile, config, prismaOptions)
}

export const generateBarrelFile = (
  models: DMMF.Model[],
  indexFile: SourceFile,
  config: Config,
) => {
  const { schema, createSchema, updateSchema } = schemaNameFormatter(config)

  models.forEach((model) =>
    indexFile.addExportDeclaration({
      moduleSpecifier: `./${model.name.toLowerCase()}${
        config.nodeEsModules ? ".js" : ""
      }`,
      namedExports: [
        schema(model.name),
        createSchema(model.name),
        updateSchema(model.name),
      ],
    }),
  )
}
