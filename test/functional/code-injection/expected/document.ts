import * as z from "zod"
import { Document } from "../prisma/.client"
import { fileNameRegex } from "../regex"

export const DocumentModel = z.object({
  id: z.string(),
  filename: z.string().regex(fileNameRegex),
  author: z.string(),
  contents: z.string(),
  created: z.date(),
  updated: z.date(),
})
