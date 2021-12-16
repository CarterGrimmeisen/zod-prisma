import * as z from "zod"
import { Post } from "../prisma/.client"

export const PostModel = z.object({
  id: z.string(),
  title: z.string(),
  contents: z.string(),
  userId: z.string(),
})
