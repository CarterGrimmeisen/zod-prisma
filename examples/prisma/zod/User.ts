import * as z from "zod"
import { UserType } from "@prisma/client"

export const UserModel = z.object({
  email: z.string(),
  name: z.string(),
  type: z.nativeEnum(UserType),
  agencyId: z.string().nullable(),
})
  
