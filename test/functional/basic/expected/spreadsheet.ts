import * as z from "zod"
import { Spreadsheet } from "@prisma/client"

export const SpreadsheetModel = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: z.any(),
  created: z.date(),
  updated: z.date(),
})
