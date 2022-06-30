import * as z from "zod"
import { Decimal } from "decimal.js"

// Helper schema for Decimal fields
const decimalSchema = z
  .instanceof(Decimal)
  .or(z.string())
  .or(z.number())
  .refine((value) => {
    try {
      return new Decimal(value)
    } catch (error) {
      return false
    }
  })
  .transform((value) => new Decimal(value))

export const additionBaseSchema = z.object({
  id: z.string(),
  addendOne: decimalSchema,
  addendTwo: decimalSchema,
  sum: decimalSchema,
})

export const additionSchema = additionBaseSchema

export const additionCreateSchema = additionBaseSchema.partial({
  id: true,
})

export const additionUpdateSchema = additionBaseSchema
  .partial()
  
