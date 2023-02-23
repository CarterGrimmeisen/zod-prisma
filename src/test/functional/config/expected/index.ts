import { _userSchema } from "./user"
import { _postSchema } from "./post"

export * from "./user"
export * from "./post"

export const db = {
  User: _userSchema,
  Post: _postSchema,
}
