import { z } from 'zod'

const configBoolean = z.enum(['true', 'false']).transform((arg) => JSON.parse(arg))

export const configSchema = z.object({
	relationModel: configBoolean.default('true').or(z.literal('default')),
	modelSuffix: z.string().default('Model'),
	modelCase: z.enum(['PascalCase', 'camelCase']).default('PascalCase'),
	useDecimalJs: configBoolean.default('false'),
	imports: z.string().optional(),
	includeJSExtension: configBoolean.default('false'),
	prismaJsonNullability: configBoolean.default('true'),
})

export type Config = z.infer<typeof configSchema>

export type PrismaOptions = {
	schemaPath: string
	outputPath: string
	clientPath: string
}

export type Names = {
	model: string
	related: string
}
