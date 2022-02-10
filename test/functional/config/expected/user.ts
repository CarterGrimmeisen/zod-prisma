import * as z from "zod"
import { PostRelations, postSchema, postBaseSchema } from "./index"

export const userBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

export interface UserRelations {
  posts: (z.infer<typeof postBaseSchema> & PostRelations)[]
}

const userRelationsSchema: z.ZodObject<{
  [K in keyof UserRelations]-?: z.ZodType<UserRelations[K]>
}> = z.object({
  posts: z.lazy(() => postSchema).array(),
})

export const userSchema = userBaseSchema.merge(userRelationsSchema)

export const userCreateSchema = userSchema.partial({
  id: true,
  posts: true,
})

export const userUpdateSchema = userSchema.partial()
