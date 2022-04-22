import * as z from "zod"
import { Status } from "./enums"

export const DocumentModel = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: z.string(),
  status: z.nativeEnum(Status),
  created: z.date(),
  updated: z.date(),
})
