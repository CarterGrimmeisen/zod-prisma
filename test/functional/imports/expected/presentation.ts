import * as z from "zod"
import { SpreadsheetRelations, spreadsheetSchema, spreadsheetBaseSchema } from "./index"

export const presentationBaseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: z.string().array(),
  created: z.date(),
  updated: z.date(),
})

export interface PresentationRelations {
  spreadsheets: (z.infer<typeof spreadsheetBaseSchema> & SpreadsheetRelations)[]
}

const presentationRelationsSchema: z.ZodObject<{
  [K in keyof PresentationRelations]-?: z.ZodType<PresentationRelations[K]>
}> = z.object({
  spreadsheets: z.lazy(() => spreadsheetSchema).array(),
})

export const presentationSchema = presentationBaseSchema.merge(presentationRelationsSchema)

export const presentationCreateSchema = presentationSchema.partial({
  id: true,
  contents: true,
  spreadsheets: true,
  created: true,
  updated: true,
})

export const presentationUpdateSchema = presentationSchema.partial()
