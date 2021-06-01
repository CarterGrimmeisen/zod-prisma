import * as z from "zod"
import "@prisma/client"
import { UserBaseModel } from "./index"

export const PostBaseModel = z.object({
  id: z.number().int(),
  title: z.string(),
  content: z.string().nullable(),
  published: z.boolean(),
  authorId: z.number().int().nullable(),
})
  
export const PostModel = PostBaseModel.extend({
  author: UserBaseModel.nullable(),
})
  
