import * as z from "zod"
import type { User } from "../prisma/.client"
import { CompletePost, RelatedPostModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | null | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const UserModel = z.object({
  id: z.number().int(),
  meta: jsonSchema,
})

export interface CompleteUser extends User {
  posts: CompletePost[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  posts: RelatedPostModel.array(),
}))
