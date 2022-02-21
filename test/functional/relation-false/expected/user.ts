import * as z from "zod"

export const userBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

export const userSchema = userBaseSchema

export const userCreateSchema = userBaseSchema.partial({
  id: true,
  posts: true,
})

export const userUpdateSchema = userBaseSchema
  .partial()
  
