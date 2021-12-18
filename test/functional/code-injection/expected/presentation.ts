import * as z from "zod"
import { Presentation } from "../prisma/.client"
import { fileNameRegex } from "../regex"

export const PresentationModel = z.object({
  id: z.string(),
  filename: z.string().regex(fileNameRegex),
  author: z.string(),
  contents: z.string().array(),
  created: z.date(),
  updated: z.date(),
})
