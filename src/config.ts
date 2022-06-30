import { z } from "zod"

const configBoolean = z
  .enum(["true", "false"])
  .transform((arg) => JSON.parse(arg))

export const configSchema = z
  .object({
    excludeRelations: configBoolean.default("false"),
    decimalJs: configBoolean.default("false"),
    imports: z
      .string()
      .nullable()
      .default(null)
      .transform((str) => (str === "null" ? null : str)),
    prismaJsonNullability: configBoolean.default("true"),
    schemaSuffix: z.string().default("Schema"),
    schemaCase: z.enum(["PascalCase", "camelCase"]).default("camelCase"),
    nodeEsModules: configBoolean.default("false"),

    // Deprecated config options
    moduleSuffix: z.undefined({
      description: "moduleSuffix was renamed to 'schemaSuffix' in v1.0.0",
    }),
    moduleCase: z.undefined({
      description: "moduleCase was renamed to 'schemaCase' in v1.0.0",
    }),
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
