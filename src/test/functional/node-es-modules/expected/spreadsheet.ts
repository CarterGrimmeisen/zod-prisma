import * as z from "zod"
import * as Prisma from "../prisma/.client/index.js"
const { Status } = Prisma

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const SpreadsheetModel = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: jsonSchema,
  status: z.nativeEnum(Status),
  created: z.date(),
  updated: z.date(),
})
