import { UserModel } from "./user"
import { PostModel } from "./post"

export * from "./user"
export * from "./post"

export const db: Record<string, any> = {
  User: UserModel,
  Post: PostModel,
}
