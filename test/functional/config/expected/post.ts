import * as z from "zod"
import { Post } from "@prisma/client"
import { CompleteUser, userSchema } from "./index"

export const _postSchema = z.object({
  id: z.string(),
  title: z.string(),
  contents: z.string(),
  userId: z.string(),
})

export interface CompletePost extends Post {
  author: CompleteUser
}

/**
 * postSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const postSchema: z.ZodSchema<CompletePost> = z.lazy(() => _postSchema.extend({
  author: userSchema,
}))
