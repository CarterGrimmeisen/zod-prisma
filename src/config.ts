import { z } from "zod"

const configBoolean = z
  .enum(["true", "false"])
  .transform((arg) => JSON.parse(arg))

export const configSchema = z
  .object({
    excludeRelations: configBoolean.default("false"),
    decimalJs: configBoolean.default("false"),
    imports: z.string().optional(),
    prismaJsonNullability: configBoolean.default("true"),
    schemaSuffix: z.string().default("Schema"),
    schemaCase: z.enum(["PascalCase", "camelCase"]).default("camelCase"),
  })
  .strict("Config cannot contain extra options")

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
