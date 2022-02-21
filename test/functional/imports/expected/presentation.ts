import * as z from "zod"
import { SpreadsheetRelations, spreadsheetRelationsSchema, spreadsheetBaseSchema } from "./spreadsheet"

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

export const presentationRelationsSchema: z.ZodObject<{
  [K in keyof PresentationRelations]: z.ZodType<PresentationRelations[K]>
}> = z.object({
  spreadsheets: z.lazy(() => spreadsheetBaseSchema.merge(spreadsheetRelationsSchema)).array(),
})

export const presentationSchema = presentationBaseSchema
  .merge(presentationRelationsSchema)

export const presentationCreateSchema = presentationBaseSchema.partial({
  id: true,
  contents: true,
  spreadsheets: true,
  created: true,
  updated: true,
})

export const presentationUpdateSchema = presentationBaseSchema
  .partial()
  
