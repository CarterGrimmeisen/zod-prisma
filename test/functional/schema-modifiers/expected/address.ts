import * as z from "zod"
import { addressTypeSchema } from "./addresstype"

export const addressBaseSchema = z.object({
  id: z.string(),
  type: addressTypeSchema,
  company: z.string().min(1).max(50).nullable(),
  address: z.string().min(1).max(50),
  zipCode: z.string().min(1).max(10),
  city: z.string().min(1).max(50),
})

export const addressSchema = addressBaseSchema
  .refine((val) => val.type === 'PRIVATE' || val.company !== null, { path: ['company'], message: 'Required if type is company' })

export const addressCreateSchema = addressBaseSchema
  .extend({
    company: addressBaseSchema.shape.company.unwrap(),
  }).partial({
    id: true,
    company: true,
  })

export const addressUpdateSchema = addressBaseSchema
  .extend({
    company: addressBaseSchema.shape.company.unwrap(),
  })
  .partial()
  
