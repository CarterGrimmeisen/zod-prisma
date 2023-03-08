import * as z from "zod"
import { CompletePost, RelatedPostModel } from "./index"

export const UserModel = z.object({
  id: z.number().int(),
  meta: z.any(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  posts?: CompletePost | null
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  posts: RelatedPostModel.nullable(),
}))
