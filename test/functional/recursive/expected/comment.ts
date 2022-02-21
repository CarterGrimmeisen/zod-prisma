import * as z from "zod"

export const commentBaseSchema = z.object({
  id: z.string(),
  author: z.string(),
  contents: z.string(),
  parentId: z.string(),
})

export interface CommentRelations {
  parent: (z.infer<typeof commentBaseSchema> & CommentRelations) | null
  children: (z.infer<typeof commentBaseSchema> & CommentRelations)[]
}

export const commentRelationsSchema: z.ZodObject<{
  [K in keyof CommentRelations]: z.ZodType<CommentRelations[K]>
}> = z.object({
  parent: z.lazy(() => commentBaseSchema.merge(commentRelationsSchema)).nullable(),
  children: z.lazy(() => commentBaseSchema.merge(commentRelationsSchema)).array(),
})

export const commentSchema = commentBaseSchema
  .merge(commentRelationsSchema)

export const commentCreateSchema = commentBaseSchema.partial({
  id: true,
  parentId: true,
  parent: true,
  children: true,
})

export const commentUpdateSchema = commentBaseSchema
  .partial()
  
