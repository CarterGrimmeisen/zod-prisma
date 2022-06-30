import type { DMMF } from "@prisma/generator-helper"
import path from "path"
import {
  ImportDeclarationStructure,
  SourceFile,
  StructureKind,
  VariableDeclarationKind,
} from "ts-morph"
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
  { schemaPath, outputPath }: PrismaOptions,
) => {
  const { baseSchema, relationsSchema, enumSchema } =
    schemaNameFormatter(config)
  const importList: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      namespaceImport: "z",
      moduleSpecifier: "zod",
    },
  ]

  if (config.imports) {
    const usesImports = model.fields.some(
      (field) =>
        field.documentation &&
        /\s*@zod.*[^.\w]imports\.\w+\W/.test(field.documentation),
    )

    if (usesImports) {
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
  }

  if (config.decimalJs && model.fields.some((f) => f.type === "Decimal")) {
    importList.push({
      kind: StructureKind.ImportDeclaration,
      namedImports: ["Decimal"],
      moduleSpecifier: "decimal.js",
    })
  }

  const enumFields = model.fields.filter((f) => f.kind === "enum")

  if (enumFields.length > 0) {
    const uniqueEnumTypes = [...new Set(enumFields.map((e) => e.type))]
    importList.push(
      ...uniqueEnumTypes.map((type) => ({
        kind: StructureKind.ImportDeclaration as const,
        moduleSpecifier: `./${type.toLowerCase()}${
          config.nodeEsModules ? ".js" : ""
        }`,
        namedImports: [enumSchema(type)],
      })),
    )
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
        "const decimalSchema = z",
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
  enums: DMMF.DatamodelEnum[],
  indexFile: SourceFile,
  config: Config,
) => {
  const { schema, createSchema, updateSchema, enumSchema } =
    schemaNameFormatter(config)

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

  enums.forEach((enumDecl) => {
    indexFile.addExportDeclaration({
      moduleSpecifier: `./${enumDecl.name.toLowerCase()}${
        config.nodeEsModules ? ".js" : ""
      }`,
      namedExports: [enumSchema(enumDecl.name)],
    })
  })
}

export const populateEnumFile = (
  enumDecl: DMMF.DatamodelEnum,
  sourceFile: SourceFile,
  config: Config,
  _prismaOptions: PrismaOptions,
) => {
  const { enumSchema } = schemaNameFormatter(config)

  sourceFile.addImportDeclaration({
    kind: StructureKind.ImportDeclaration,
    namespaceImport: "z",
    moduleSpecifier: "zod",
  })

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: enumSchema(enumDecl.name),
        initializer: `z.enum(["${enumDecl.values
          .map((e) => e.name)
          .join('", "')}"])`,
      },
    ],
  })
}
