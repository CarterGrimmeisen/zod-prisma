import * as z from "nestjs-zod/z"

export const DocumentModel = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: z.string(),
  created: z.date(),
  updated: z.date(),
})
