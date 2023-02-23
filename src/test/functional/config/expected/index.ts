import { _userSchema } from "./user"
import { _postSchema } from "./post"

export * from "./user"
export * from "./post"

export const db: Record<string, any> = {
  User: _userSchema,
  Post: _postSchema,
}
