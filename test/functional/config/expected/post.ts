import * as z from "zod"
import { UserRelations, UserRelationsModel, UserBaseModel } from "./user"

export const PostBaseModel = z.object({
  id: z.string(),
  title: z.string(),
  contents: z.string(),
  userId: z.string(),
})

export interface PostRelations {
  author: z.infer<typeof UserBaseModel> & UserRelations
}

export const PostRelationsModel: z.ZodObject<{
  [K in keyof PostRelations]: z.ZodType<PostRelations[K]>
}> = z.object({
  author: z.lazy(() => UserBaseModel.merge(UserRelationsModel)),
})

export const PostModel = PostBaseModel
  .merge(PostRelationsModel)

export const PostCreateModel = PostBaseModel.partial({
  id: true,
  userId: true,
})

export const PostUpdateModel = PostBaseModel
  .partial()
  
