import path from 'path'
import { DMMF } from '@prisma/generator-helper'
import {
	ImportDeclarationStructure,
	SourceFile,
	StructureKind,
	VariableDeclarationKind,
} from 'ts-morph'
import { Config, PrismaOptions } from './config'
import { needsRelatedModel, useModelNames, writeArray } from './util'
import { getJSDocs } from './docs'
import { getZodConstructor } from './types'

export const writeImportsForModel = (
	model: DMMF.Model,
	sourceFile: SourceFile,
	config: Config,
	{ schemaPath, outputPath, clientPath }: PrismaOptions
) => {
	const { relatedModelName } = useModelNames(config)
	const importList: ImportDeclarationStructure[] = [
		{
			kind: StructureKind.ImportDeclaration,
			namespaceImport: 'z',
			moduleSpecifier: 'zod',
		},
	]

	if (config.imports) {
		importList.push({
			kind: StructureKind.ImportDeclaration,
			namespaceImport: 'imports',
			moduleSpecifier: path.relative(
				outputPath,
				path.resolve(path.dirname(schemaPath), config.imports)
			),
		})
	}

	const enumFields = model.fields.filter((f) => f.kind === 'enum')
	const relationFields = model.fields.filter((f) => f.kind === 'object')
	const relativePath = path.relative(outputPath, clientPath)

	if ((config.relationModel !== false && relationFields.length > 0) || enumFields.length > 0) {
		importList.push({
			kind: StructureKind.ImportDeclaration,
			isTypeOnly: enumFields.length === 0,
			moduleSpecifier: relativePath,
			namedImports:
				config.relationModel !== false && relationFields.length > 0
					? [model.name, ...enumFields.map((f) => f.type)]
					: enumFields.map((f) => f.type),
		})
	}

	if (config.relationModel !== false && relationFields.length > 0) {
		const filteredFields = relationFields.filter((f) => f.type !== model.name)

		if (filteredFields.length > 0) {
			importList.push({
				kind: StructureKind.ImportDeclaration,
				moduleSpecifier: './index',
				namedImports: Array.from(
					new Set(
						filteredFields.flatMap((f) => [
							`Complete${f.type}`,
							relatedModelName(f.type),
						])
					)
				),
			})
		}
	}

	sourceFile.addImportDeclarations(importList)
}

export const writeTypeSpecificSchemas = (
	model: DMMF.Model,
	sourceFile: SourceFile,
	_config: Config,
	_prismaOptions: PrismaOptions
) => {
	if (model.fields.some((f) => f.type === 'Json')) {
		sourceFile.addStatements((writer) => {
			writer.newLine()
			writeArray(writer, [
				'// Helper schema for JSON data',
				'type Literal = boolean | null | number | string',
				'type Json = Literal | { [key: string]: Json } | Json[]',
				'const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])',
				'const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))',
			])
		})
	}

	// TODO: Add Decimal
}

export const generateSchemaForModel = (
	model: DMMF.Model,
	sourceFile: SourceFile,
	config: Config,
	_prismaOptions: PrismaOptions
) => {
	const { modelName } = useModelNames(config)

	sourceFile.addVariableStatement({
		declarationKind: VariableDeclarationKind.Const,
		isExported: true,
		leadingTrivia: (writer) => writer.blankLineIfLastNot(),
		declarations: [
			{
				name: modelName(model.name),
				initializer(writer) {
					writer
						.write('z.object(')
						.inlineBlock(() => {
							model.fields
								.filter((f) => f.kind !== 'object')
								.forEach((field) => {
									writeArray(writer, getJSDocs(field.documentation))
									writer
										.write(`${field.name}: ${getZodConstructor(field)}`)
										.write(',')
										.newLine()
								})
						})
						.write(')')
				},
			},
		],
	})
}

export const generateRelatedSchemaForModel = (
	model: DMMF.Model,
	sourceFile: SourceFile,
	config: Config,
	_prismaOptions: PrismaOptions
) => {
	const { modelName, relatedModelName } = useModelNames(config)

	const relationFields = model.fields.filter((f) => f.kind === 'object')

	sourceFile.addInterface({
		name: `Complete${model.name}`,
		isExported: true,
		extends: (writer) => writer.write(model.name),
		properties: relationFields.map((f) => ({
			name: f.name,
			type: `Complete${f.type}${f.isList ? '[]' : ''}${!f.isRequired ? ' | null' : ''}`,
		})),
	})

	sourceFile.addStatements((writer) =>
		writeArray(writer, [
			'',
			'/**',
			` * ${relatedModelName(
				model.name
			)} contains all relations on your model in addition to the scalars`,
			' *',
			' * NOTE: Lazy required in case of potential circular dependencies within schema',
			' */',
		])
	)

	sourceFile.addVariableStatement({
		declarationKind: VariableDeclarationKind.Const,
		isExported: true,
		declarations: [
			{
				name: relatedModelName(model.name),
				type: `z.ZodSchema<Complete${model.name}>`,
				initializer(writer) {
					writer
						.write(`z.lazy(() => ${modelName(model.name)}.extend(`)
						.inlineBlock(() => {
							relationFields.forEach((field) => {
								writeArray(writer, getJSDocs(field.documentation))

								writer
									.write(
										`${field.name}: ${getZodConstructor(
											field,
											relatedModelName
										)}`
									)
									.write(',')
									.newLine()
							})
						})
						.write('))')
				},
			},
		],
	})
}

export const populateModelFile = (
	model: DMMF.Model,
	sourceFile: SourceFile,
	config: Config,
	prismaOptions: PrismaOptions
) => {
	writeImportsForModel(model, sourceFile, config, prismaOptions)
	writeTypeSpecificSchemas(model, sourceFile, config, prismaOptions)
	generateSchemaForModel(model, sourceFile, config, prismaOptions)
	if (needsRelatedModel(model, config))
		generateRelatedSchemaForModel(model, sourceFile, config, prismaOptions)
}

export const generateBarrelFile = (models: DMMF.Model[], indexFile: SourceFile) => {
	models.forEach((model) =>
		indexFile.addExportDeclaration({
			moduleSpecifier: `./${model.name.toLowerCase()}`,
		})
	)
}
