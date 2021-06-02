import * as z from "zod"
import "@prisma/client"

export const AuthModel = z.object({
  userEmail: z.string(),
  hash: z.string(),
})
  
