import * as z from "zod"
import { UserRelations, userSchema, userBaseSchema } from "./index"

export const postBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  contents: z.string(),
  userId: z.string(),
})

export interface PostRelations {
  author: z.infer<typeof userBaseSchema> & UserRelations
}

const postRelationsSchema: z.ZodObject<{
  [K in keyof PostRelations]-?: z.ZodType<PostRelations[K]>
}> = z.object({
  author: z.lazy(() => userSchema),
})

export const postSchema = postBaseSchema.merge(postRelationsSchema)

export const postCreateSchema = postSchema.partial({
  id: true,
  userId: true,
})

export const postUpdateSchema = postSchema.partial()
