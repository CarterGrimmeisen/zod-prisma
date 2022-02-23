import * as z from "zod"
import prisma from "../prisma/.client"

export const DocumentModel = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: z.string(),
  status: z.nativeEnum(prisma.Status),
  created: z.date(),
  updated: z.date(),
})
