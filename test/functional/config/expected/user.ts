import * as z from "zod"
import type { User } from "../prisma/.client"
import { CompletePost, postSchema } from "./index"

export const _userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

export interface CompleteUser extends User {
  posts: CompletePost[]
}

/**
 * userSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const userSchema: z.ZodSchema<CompleteUser> = z.lazy(() => _userSchema.extend({
  posts: postSchema.array(),
}))
