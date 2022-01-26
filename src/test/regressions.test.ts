import path from 'path'
import { configSchema, PrismaOptions } from '../config'
import { writeImportsForModel } from '../generator'
import { getDMMF } from '@prisma/sdk'
import { Project } from 'ts-morph'

describe('Regression Tests', () => {
	test('#92', async () => {
		const config = configSchema.parse({})
		const prismaOptions: PrismaOptions = {
			clientPath: path.resolve(__dirname, '../node_modules/@prisma/client'),
			outputPath: path.resolve(__dirname, './prisma/zod'),
			schemaPath: path.resolve(__dirname, './prisma/schema.prisma'),
		}

		const {
			datamodel: {
				models: [model],
			},
		} = await getDMMF({
			datamodel: `enum UserType {
				USER
				ADMIN
			}
			
			model User {
				id			String @id
				type		UserType
			}`,
		})

		const project = new Project()
		const testFile = project.createSourceFile('test.ts')

		writeImportsForModel(model, testFile, config, prismaOptions)

		expect(testFile.print()).toBe(
			'import * as z from "zod";\nimport { UserType } from "@prisma/client";\n'
		)
	})
})
