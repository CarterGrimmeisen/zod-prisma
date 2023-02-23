import { CommentModel } from "./comment"

export * from "./comment"

export const db: Record<string, any> = {
  Comment: CommentModel,
}
