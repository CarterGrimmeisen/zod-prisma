import path from 'path'
import { generatorHandler, DMMF } from '@prisma/generator-helper'
import { Project, StructureKind, VariableDeclarationKind } from 'ts-morph'
import { SemicolonPreference } from 'typescript'
import { getJSDocs } from './docs'
import { getZodConstructor } from './types'
import { writeArray } from './util'
import z from 'zod'

const configSchema = z.object({
	relationModel: z
		.enum(['default', 'true', 'false'])
		.default('true')
		.transform((val) => {
			switch (val) {
				case 'default':
					return val
				case 'true':
					return true
				case 'false':
					return false
			}
		}),
	modelSuffix: z.string().default('Model'),
	modelCase: z.enum(['PascalCase', 'camelCase']).default('PascalCase'),
	imports: z.string().optional(),
})

generatorHandler({
	onManifest() {
		return {
			prettyName: 'Zod Schemas',
			defaultOutput: 'zod',
			version: '0.2.1',
		}
	},
	onGenerate(options) {
		const project = new Project({
			skipAddingFilesFromTsConfig: true,
		})

		const outputPath = options.generator.output!.value
		const models = options.dmmf.datamodel.models

		const prismaClient = options.otherGenerators.find(
			(each) => each.provider.value === 'prisma-client-js'
		)

		const parsedConfig = configSchema.safeParse(options.generator.config)
		if (!parsedConfig.success)
			throw new Error(
				'Incorrect config provided. Please check the values you provided and try again.'
			)

		const { relationModel, modelSuffix, modelCase, imports } =
			parsedConfig.data

		const formatModelName = (name: string, prefix = '') => {
			if (modelCase === 'camelCase') {
				name = name.slice(0, 1).toLowerCase() + name.slice(1)
			}
			return `${prefix}${name}${modelSuffix}`
		}

		const indexSource = project.createSourceFile(
			`${outputPath}/index.ts`,
			{},
			{
				overwrite: true,
			}
		)

		models.forEach((model) => {
			indexSource.addExportDeclaration({
				moduleSpecifier: `./${model.name.toLowerCase()}`,
			})

			const modelName = (name: string) =>
				formatModelName(name, relationModel === 'default' ? '_' : '')

			const relatedModelName = (
				name:
					| string
					| DMMF.SchemaEnum
					| DMMF.OutputType
					| DMMF.SchemaArg
			) =>
				formatModelName(
					relationModel === 'default'
						? name.toString()
						: `Related${name.toString()}`
				)

			const sourceFile = project.createSourceFile(
				`${outputPath}/${model.name.toLowerCase()}.ts`,
				{
					statements: [
						{
							kind: StructureKind.ImportDeclaration,
							namespaceImport: 'z',
							moduleSpecifier: 'zod',
						},
					],
				},
				{
					overwrite: true,
				}
			)

			const enumFields = model.fields.filter((f) => f.kind === 'enum')

			let relativePath = path.relative(
				outputPath,
				prismaClient!.output!.value
			)

			if (relativePath.endsWith('/node_modules/@prisma/client')) {
				relativePath = '@prisma/client'
			} else if (
				!relativePath.startsWith('./') &&
				!relativePath.startsWith('../')
			) {
				relativePath = `./${relativePath}`
			}

			const relationFields = model.fields.filter(
				(f) => f.kind === 'object'
			)

			if (
				(relationModel !== false && relationFields.length > 0) ||
				enumFields.length > 0
			) {
				sourceFile.addImportDeclaration({
					kind: StructureKind.ImportDeclaration,
					isTypeOnly: enumFields.length === 0,
					moduleSpecifier: relativePath,
					namedImports:
						relationModel !== false && relationFields.length > 0
							? [model.name, ...enumFields.map((f) => f.type)]
							: enumFields.map((f) => f.type),
				})
			}

			if (imports) {
				sourceFile.addImportDeclaration({
					kind: StructureKind.ImportDeclaration,
					moduleSpecifier: path.relative(
						outputPath,
						path.resolve(path.dirname(options.schemaPath), imports)
					),
					namespaceImport: 'imports',
				})
			}

			sourceFile.addStatements((writer) =>
				writeArray(writer, getJSDocs(model.documentation))
			)

			const hasJson = model.fields.some((f) => f.type === 'Json')
			if (hasJson) {
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

			sourceFile.addVariableStatement({
				declarationKind: VariableDeclarationKind.Const,
				isExported: true,
				leadingTrivia: (writer) => writer.conditionalNewLine(hasJson),
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
											writeArray(
												writer,
												getJSDocs(field.documentation)
											)
											writer
												.write(
													`${
														field.name
													}: ${getZodConstructor(
														field
													)}`
												)
												.write(',')
												.newLine()
										})
								})
								.write(')')
						},
					},
				],
			})

			if (relationModel !== false && relationFields.length > 0) {
				const filteredFields = relationFields.filter(
					(f) => f.type !== model.name
				)

				if (filteredFields.length > 0) {
					sourceFile.addImportDeclaration({
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

				sourceFile.addInterface({
					name: `Complete${model.name}`,
					isExported: true,
					extends: (writer) => writer.write(model.name),
					properties: relationFields.map((f) => ({
						name: f.name,
						type: `Complete${f.type}${f.isList ? '[]' : ''}${
							!f.isRequired ? ' | null' : ''
						}`,
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
									.write(
										`z.lazy(() => ${modelName(
											model.name
										)}.extend(`
									)
									.inlineBlock(() => {
										relationFields.forEach((field) => {
											writeArray(
												writer,
												getJSDocs(field.documentation)
											)

											writer
												.write(
													`${
														field.name
													}: ${getZodConstructor(
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

			sourceFile.formatText({
				indentSize: 2,
				convertTabsToSpaces: true,
				semicolons: SemicolonPreference.Remove,
			})
		})

		return project.save()
	},
})
