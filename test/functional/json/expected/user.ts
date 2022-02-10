import * as z from "zod"
import { PostRelations, postSchema, postBaseSchema } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
)

export const userBaseSchema = z.object({
  id: z.number().int(),
  meta: jsonSchema,
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
