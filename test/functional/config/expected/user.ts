import * as z from "zod"
import { PostRelations, PostRelationsModel, PostBaseModel } from "./post"

export const UserBaseModel = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

export interface UserRelations {
  posts: (z.infer<typeof PostBaseModel> & PostRelations)[]
}

export const UserRelationsModel: z.ZodObject<{
  [K in keyof UserRelations]: z.ZodType<UserRelations[K]>
}> = z.object({
  posts: z.lazy(() => PostBaseModel.merge(PostRelationsModel)).array(),
})

export const UserModel = UserBaseModel
  .merge(UserRelationsModel)

export const UserCreateModel = UserBaseModel.partial({
  id: true,
  posts: true,
})

export const UserUpdateModel = UserBaseModel
  .partial()
  
