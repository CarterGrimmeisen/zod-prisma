import * as z from "zod"
import "@prisma/client"

export const ListingModel = z.object({
  mlsn: z.string(),
  description: z.string(),
  price: z.number(),
  sqft: z.number().int(),
  bedrooms: z.number().int(),
  bathrooms: z.number(),
  hoa: z.boolean(),
  images: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipcode: z.number().int(),
  agentEmail: z.string(),
  occupied: z.boolean(),
  alarmInfo: z.string(),
  dailyHits: z.number().int(),
})
  
