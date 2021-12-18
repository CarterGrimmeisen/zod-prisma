import * as z from "zod"
import { Spreadsheet } from "../prisma/.client"
import { fileNameRegex } from "../regex"

export const SpreadsheetModel = z.object({
  id: z.string(),
  filename: z.string().regex(fileNameRegex),
  author: z.string(),
  contents: z.any(),
  created: z.date(),
  updated: z.date(),
})
