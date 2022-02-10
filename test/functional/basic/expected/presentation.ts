import * as z from "zod"

export const presentationBaseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  author: z.string(),
  contents: z.string().array(),
  created: z.date(),
  updated: z.date(),
})

export const presentationSchema = presentationBaseSchema

export const presentationCreateSchema = presentationSchema.partial({
  id: true,
  contents: true,
  created: true,
  updated: true,
})

export const presentationUpdateSchema = presentationSchema.partial()
