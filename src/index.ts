import { generatorHandler } from '@prisma/generator-helper'
import { Project, StructureKind, VariableDeclarationKind } from 'ts-morph'
import { SemicolonPreference } from 'typescript'
import { getJSDocs } from './docs'
import { getZodConstructor } from './types'
import { writeArray } from './util'

interface Config {
	relationModel: boolean | 'default'
	clientOutputPath?: string
}

generatorHandler({
	onManifest() {
		return {
			prettyName: 'Zod Schemas',
			defaultOutput: 'zod',
			version: '0.1.0',
		}
	},
	onGenerate(options) {
		const project = new Project({
			skipAddingFilesFromTsConfig: true,
		})

		const outputPath = options.generator.output!.value
		const models = options.dmmf.datamodel.models

		const { relationModel, clientOutputPath } = options.generator
			.config as unknown as Config

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
				relationModel === 'default' ? `_${name}Model` : `${name}Model`
			const relatedModelName = (name: string) =>
				relationModel === 'default'
					? `${name}Model`
					: `Related${name}Model`

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

			sourceFile.addImportDeclaration({
				kind: StructureKind.ImportDeclaration,
				moduleSpecifier: clientOutputPath || '@prisma/client',
				namedImports: [model.name, ...enumFields.map((f) => f.type)],
			})

			sourceFile.addStatements((writer) =>
				writeArray(writer, getJSDocs(model.documentation))
			)

			sourceFile.addVariableStatement({
				declarationKind: VariableDeclarationKind.Const,
				isExported: true,
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

			const relationFields = model.fields.filter(
				(f) => f.kind === 'object'
			)

			if (relationModel !== false && relationFields.length > 0) {
				sourceFile.addImportDeclaration({
					kind: StructureKind.ImportDeclaration,
					moduleSpecifier: './index',
					namedImports: Array.from(
						new Set(
							relationFields.flatMap((f) => [
								`Complete${f.type}`,
								relatedModelName(f.type),
							])
						)
					),
				})

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
									.write(')).schema')
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
