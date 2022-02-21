import * as z from "zod"
import * as imports from "../prisma/zod-utils"

export const documentBaseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: z.string(),
  size: imports.decimalSchema,
  created: z.date(),
  updated: z.date(),
})

export const documentSchema = documentBaseSchema

export const documentCreateSchema = documentBaseSchema.partial({
  id: true,
  created: true,
  updated: true,
})

export const documentUpdateSchema = documentBaseSchema
  .partial()
  
