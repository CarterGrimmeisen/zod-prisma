import * as z from "zod"
import { UserRelations, userSchema, userBaseSchema } from "./index"

export const postBaseSchema = z.object({
  id: z.number().int(),
  authorId: z.number().int(),
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
  authorId: true,
})

export const postUpdateSchema = postSchema.partial()
