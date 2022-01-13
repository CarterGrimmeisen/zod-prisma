import { z } from 'zod'

export const configSchema = z.object({
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
