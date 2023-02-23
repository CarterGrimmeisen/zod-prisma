import { UserModel } from "./user"
import { PostModel } from "./post"

export * from "./user"
export * from "./post"

export const db = {
  User: UserModel,
  Post: PostModel,
}
