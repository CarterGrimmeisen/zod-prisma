import { PostModel } from "./post"

export * from "./post"

export const db: Record<string, any> = {
  Post: PostModel,
}
