import * as z from "zod"
import { PresentationRelations, presentationSchema, presentationBaseSchema } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
)

export const spreadsheetBaseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: jsonSchema,
  created: z.date(),
  updated: z.date(),
})

export interface SpreadsheetRelations {
  presentations: (z.infer<typeof presentationBaseSchema> & PresentationRelations)[]
}

const spreadsheetRelationsSchema: z.ZodObject<{
  [K in keyof SpreadsheetRelations]-?: z.ZodType<SpreadsheetRelations[K]>
}> = z.object({
  presentations: z.lazy(() => presentationSchema).array(),
})

export const spreadsheetSchema = spreadsheetBaseSchema.merge(spreadsheetRelationsSchema)

export const spreadsheetCreateSchema = spreadsheetSchema.partial({
  id: true,
  presentations: true,
  created: true,
  updated: true,
})

export const spreadsheetUpdateSchema = spreadsheetSchema.partial()
