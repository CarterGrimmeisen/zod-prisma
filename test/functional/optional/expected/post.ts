import * as z from "zod"
import { UserRelations, userSchema, userBaseSchema } from "./index"

export const postBaseSchema = z.object({
  id: z.number().int(),
  authorId: z.number().int(),
})

export interface PostRelations {
  author?: (z.infer<typeof userBaseSchema> & UserRelations) | null
}

const postRelationsSchema: z.ZodObject<{
  [K in keyof PostRelations]-?: z.ZodType<PostRelations[K]>
}> = z.object({
  author: z.lazy(() => userSchema).nullable(),
})

export const postSchema = postBaseSchema.merge(postRelationsSchema)

export const postCreateSchema = postSchema.partial({
  id: true,
  authorId: true,
  author: true,
})

export const postUpdateSchema = postSchema.partial()
