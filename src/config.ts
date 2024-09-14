import { z } from 'zod'

const configBoolean = z.enum(['true', 'false']).transform((arg) => JSON.parse(arg))

export const configSchema = z.object({
  relationModel: configBoolean.default('true').or(z.literal('default')),
  modelSuffix: z.string().default('Model'),
  modelCase: z.enum(['PascalCase', 'camelCase']).default('PascalCase'),
  imports: z.string().optional(),
  prismaJsonNullability: configBoolean.default('true'),
  prisma: z.string().default('@prisma/client'), // Path to prisma client, defaults to '@prisma/client'
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
