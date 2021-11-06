import * as z from "zod"
import { Post } from "@prisma/client"
import { CompleteUser, UserModel } from "./index"

export const _PostModel = z.object({
  id: z.string(),
  title: z.string(),
  contents: z.string(),
  userId: z.string(),
})

export interface CompletePost extends Post {
  author: CompleteUser
}

/**
 * PostModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PostModel: z.ZodSchema<CompletePost> = z.lazy(() => _PostModel.extend({
  author: UserModel,
}))
