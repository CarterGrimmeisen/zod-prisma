import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"

export const postBaseSchema = z.object({
  id: z.number().int(),
  authorId: z.number().int(),
})

export interface PostRelations {
  author: z.infer<typeof userBaseSchema> & UserRelations
}

export const postRelationsSchema: z.ZodObject<{
  [K in keyof PostRelations]: z.ZodType<PostRelations[K]>
}> = z.object({
  author: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
})

export const postSchema = postBaseSchema
  .merge(postRelationsSchema)

export const postCreateSchema = postBaseSchema.partial({
  id: true,
  authorId: true,
})

export const postUpdateSchema = postBaseSchema
  .partial()
  
