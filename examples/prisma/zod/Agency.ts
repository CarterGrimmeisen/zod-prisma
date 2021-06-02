import * as z from "zod"
import "@prisma/client"

export const AgencyModel = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  phone: z.string(),
})
  
