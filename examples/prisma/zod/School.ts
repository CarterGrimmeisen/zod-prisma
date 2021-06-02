import * as z from "zod"
import "@prisma/client"

export const SchoolModel = z.object({
  id: z.string(),
  name: z.string(),
  grades: z.number().int(),
})
  
