import * as z from "zod"
import { User } from "@prisma/client"
import { CompletePost, PostModel } from "./index"

export const _UserModel = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

export interface CompleteUser extends User {
  posts: CompletePost[]
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserModel = z.lazy(() => _UserModel.extend({
  posts: PostModel.array(),
})).schema
