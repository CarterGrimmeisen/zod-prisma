import * as z from "zod"
import type { Post } from "../prisma/.client"
import { CompleteUser, RelatedUserModel } from "./index"

export const PostModel = z.object({
  id: z.number().int(),
  authorId: z.number().int(),
})

export interface CompletePost extends Post {
  author: CompleteUser
}

/**
 * RelatedPostModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPostModel: z.ZodSchema<CompletePost> = z.lazy(() => PostModel.extend({
  author: RelatedUserModel,
}))
