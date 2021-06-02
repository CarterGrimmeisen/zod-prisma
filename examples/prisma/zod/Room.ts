import * as z from "zod"
import "@prisma/client"

export const RoomModel = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  listingMlsn: z.string(),
})
  
