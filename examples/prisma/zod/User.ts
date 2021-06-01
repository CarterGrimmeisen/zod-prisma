import * as z from "zod"
import { UserType } from "@prisma/client"
import { PostBaseModel } from "./index"

export const UserBaseModel = z.object({
  id: z.number().int(),
  email: z.string(),
  name: z.string().nullable(),
  type: z.nativeEnum(UserType),
})
  
export const UserModel = UserBaseModel.extend({
  posts: z.array(PostBaseModel),
})
  
